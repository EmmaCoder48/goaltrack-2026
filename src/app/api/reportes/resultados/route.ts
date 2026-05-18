import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const faseId = searchParams.get('fase');

    let sql = `
      SELECT 
        u.Id_usuario,
        u.Nombre AS usuario_nombre,
        f.Id_fase,
        f.Nombre AS fase_nombre,
        COUNT(q.Id_quinela) AS quinielas,
        COALESCE(SUM(q.Puntos), 0) AS total_puntos
      FROM Usuario u
      LEFT JOIN Quinela q ON q.Id_usuario = u.Id_usuario
      LEFT JOIN Partido p ON q.Id_partido = p.Id_partido
      LEFT JOIN Fase f ON p.Id_fase = f.Id_fase
    `;

    const params: any[] = [];
    if (faseId) {
      sql += ' WHERE f.Id_fase = $1';
      params.push(faseId);
    }

    sql += ` GROUP BY u.Id_usuario, u.Nombre, f.Id_fase, f.Nombre
             ORDER BY total_puntos DESC, u.Nombre`;

    const resultados = await query(sql, params);
    return NextResponse.json(resultados);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
