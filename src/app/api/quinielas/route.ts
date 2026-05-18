import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get('usuario');
    const faseId = searchParams.get('fase');

    let sql = `
      SELECT q.*, 
        p.Fecha_Hora, p.Goles_local, p.Goles_visitante,
        e1.Nombre AS local_nombre, e1.Bandera AS local_bandera,
        e2.Nombre AS visitante_nombre, e2.Bandera AS visitante_bandera,
        f.Nombre AS fase_nombre, u.Nombre AS usuario_nombre
      FROM Quinela q
      JOIN Partido p ON q.Id_partido = p.Id_partido
      LEFT JOIN Equipo e1 ON p.Id_equipo_local = e1.Id_equipo
      LEFT JOIN Equipo e2 ON p.Id_equipo_visitante = e2.Id_equipo
      JOIN Fase f ON p.Id_fase = f.Id_fase
      JOIN Usuario u ON q.Id_usuario = u.Id_usuario
      WHERE 1=1
    `;
    const params: any[] = [];
    let i = 1;
    if (usuarioId) { sql += ` AND q.Id_usuario = $${i++}`; params.push(usuarioId); }
    if (faseId) { sql += ` AND p.Id_fase = $${i++}`; params.push(faseId); }
    sql += ' ORDER BY p.Fecha_Hora ASC';

    const quinielas = await query(sql, params);
    return NextResponse.json(quinielas);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_usuario, id_partido, pred_local, pred_visitante } = await req.json();

    if (!id_usuario || !id_partido || pred_local === undefined || pred_visitante === undefined) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Verificar que el partido no haya empezado
    const [partido] = await query<any>('SELECT Fecha_Hora FROM Partido WHERE Id_partido=$1', [id_partido]);
    if (!partido) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });

    if (new Date(partido.fecha_hora) < new Date()) {
      return NextResponse.json({ error: 'No se puede ingresar quiniela para un partido que ya empezó' }, { status: 409 });
    }

    const [quinela] = await query(
      `INSERT INTO Quinela (Id_usuario, Id_partido, pred_local, pred_visitante)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT ON CONSTRAINT una_quinela_por_partido
       DO UPDATE SET pred_local=$3, pred_visitante=$4
       RETURNING *`,
      [id_usuario, id_partido, pred_local, pred_visitante]
    );
    return NextResponse.json(quinela, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
