import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { calcularPuntos } from '@/lib/puntos';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [partido] = await query(`
      SELECT p.*,
        e1.Nombre AS local_nombre, e1.Bandera AS local_bandera,
        e2.Nombre AS visitante_nombre, e2.Bandera AS visitante_bandera,
        f.Nombre AS fase_nombre
      FROM Partido p
      LEFT JOIN Equipo e1 ON p.Id_equipo_local = e1.Id_equipo
      LEFT JOIN Equipo e2 ON p.Id_equipo_visitante = e2.Id_equipo
      JOIN Fase f ON p.Id_fase = f.Id_fase
      WHERE p.Id_partido = $1
    `, [params.id]);
    if (!partido) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(partido);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { goles_local, goles_visitante, id_fase, id_equipo_local, id_equipo_visitante, fecha_hora } = body;

    // Update partido
    const [partido] = await query(
      `UPDATE Partido
       SET Goles_local=$1, Goles_visitante=$2, Id_fase=$3,
           Id_equipo_local=$4, Id_equipo_visitante=$5, Fecha_Hora=$6
       WHERE Id_partido=$7 RETURNING *`,
      [
        goles_local ?? null,
        goles_visitante ?? null,
        id_fase,
        id_equipo_local,
        id_equipo_visitante,
        fecha_hora,
        params.id,
      ]
    );

    // Si hay resultado, recalcular puntos de quinielas
    if (goles_local !== null && goles_local !== undefined &&
        goles_visitante !== null && goles_visitante !== undefined) {
      const quinielas = await query(
        'SELECT * FROM Quinela WHERE Id_partido=$1',
        [params.id]
      );
      for (const q of quinielas as any[]) {
        const puntos = calcularPuntos(goles_local, goles_visitante, q.pred_local, q.pred_visitante);
        await query('UPDATE Quinela SET Puntos=$1 WHERE Id_quinela=$2', [puntos, q.id_quinela]);
      }
    }

    return NextResponse.json(partido);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM Partido WHERE Id_partido=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
