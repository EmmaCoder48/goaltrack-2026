import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const faseId = searchParams.get('fase');

    let sql = `
      SELECT p.*,
        e1.Nombre AS local_nombre, e1.Bandera AS local_bandera, e1.Grupo AS local_grupo,
        e2.Nombre AS visitante_nombre, e2.Bandera AS visitante_bandera,
        f.Nombre AS fase_nombre
      FROM Partido p
      LEFT JOIN Equipo e1 ON p.Id_equipo_local = e1.Id_equipo
      LEFT JOIN Equipo e2 ON p.Id_equipo_visitante = e2.Id_equipo
      JOIN Fase f ON p.Id_fase = f.Id_fase
    `;
    const params: any[] = [];
    if (faseId) {
      sql += ' WHERE p.Id_fase = $1';
      params.push(faseId);
    }
    sql += ' ORDER BY p.Fecha_Hora ASC';

    const partidos = await query(sql, params);
    return NextResponse.json(partidos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_fase, id_equipo_local, id_equipo_visitante, fecha_hora } = await req.json();

    if (!id_fase || !id_equipo_local || !id_equipo_visitante || !fecha_hora) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (id_equipo_local === id_equipo_visitante) {
      return NextResponse.json({ error: 'Los equipos deben ser distintos' }, { status: 400 });
    }

    // Verificar traslapes: cada equipo solo puede jugar UN partido por fase (grupos)
    const traslape = await query(`
      SELECT Id_partido FROM Partido
      WHERE Id_fase = $1
        AND (
          Id_equipo_local IN ($2,$3)
          OR Id_equipo_visitante IN ($2,$3)
        )
    `, [id_fase, id_equipo_local, id_equipo_visitante]);

    if (traslape.length > 0) {
      return NextResponse.json({
        error: 'Traslape detectado: uno o ambos equipos ya tienen un partido en esta fase'
      }, { status: 409 });
    }

    const [partido] = await query(
      `INSERT INTO Partido (Id_fase, Id_equipo_local, Id_equipo_visitante, Fecha_Hora)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_fase, id_equipo_local, id_equipo_visitante, fecha_hora]
    );
    return NextResponse.json(partido, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
