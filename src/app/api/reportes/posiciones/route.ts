import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Calcular tabla de posiciones: partidos jugados, goles a favor, en contra, puntos
    // Puntos: Victoria = 3, Empate = 1, Derrota = 0
    const equipos = await query<any>(`
      SELECT 
        e.Id_equipo,
        e.Nombre,
        e.Bandera,
        e.Grupo,
        COUNT(CASE WHEN p.Goles_local IS NOT NULL THEN 1 END) AS PJ,
        COUNT(CASE WHEN p.Goles_local > p.Goles_visitante THEN 1 END) AS PG,
        COUNT(CASE WHEN p.Goles_local = p.Goles_visitante AND p.Goles_local IS NOT NULL THEN 1 END) AS PE,
        COUNT(CASE WHEN p.Goles_local < p.Goles_visitante THEN 1 END) AS PP,
        COALESCE(SUM(p.Goles_local), 0) AS GF,
        COALESCE(SUM(p.Goles_visitante), 0) AS GC,
        COALESCE(SUM(
          CASE 
            WHEN p.Goles_local > p.Goles_visitante THEN 3
            WHEN p.Goles_local = p.Goles_visitante AND p.Goles_local IS NOT NULL THEN 1
            ELSE 0
          END
        ), 0) AS Pts
      FROM Equipo e
      LEFT JOIN Partido p ON p.Id_equipo_local = e.Id_equipo
      GROUP BY e.Id_equipo, e.Nombre, e.Bandera, e.Grupo

      UNION ALL

      SELECT
        e.Id_equipo,
        e.Nombre,
        e.Bandera,
        e.Grupo,
        COUNT(CASE WHEN p.Goles_visitante IS NOT NULL THEN 1 END) AS PJ,
        COUNT(CASE WHEN p.Goles_visitante > p.Goles_local THEN 1 END) AS PG,
        COUNT(CASE WHEN p.Goles_visitante = p.Goles_local AND p.Goles_visitante IS NOT NULL THEN 1 END) AS PE,
        COUNT(CASE WHEN p.Goles_visitante < p.Goles_local THEN 1 END) AS PP,
        COALESCE(SUM(p.Goles_visitante), 0) AS GF,
        COALESCE(SUM(p.Goles_local), 0) AS GC,
        COALESCE(SUM(
          CASE
            WHEN p.Goles_visitante > p.Goles_local THEN 3
            WHEN p.Goles_visitante = p.Goles_local AND p.Goles_visitante IS NOT NULL THEN 1
            ELSE 0
          END
        ), 0) AS Pts
      FROM Equipo e
      LEFT JOIN Partido p ON p.Id_equipo_visitante = e.Id_equipo
      GROUP BY e.Id_equipo, e.Nombre, e.Bandera, e.Grupo
    `);

    // Agrupar por equipo sumando ambas columnas
    const map = new Map<number, any>();
    for (const row of equipos) {
      const id = row.id_equipo;
      if (!map.has(id)) {
        map.set(id, { ...row, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const e = map.get(id)!;
      e.pj += parseInt(row.pj);
      e.pg += parseInt(row.pg);
      e.pe += parseInt(row.pe);
      e.pp += parseInt(row.pp);
      e.gf += parseInt(row.gf);
      e.gc += parseInt(row.gc);
      e.pts += parseInt(row.pts);
    }

    const resultado = Array.from(map.values())
      .map(e => ({ ...e, dg: e.gf - e.gc }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

    return NextResponse.json(resultado);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
