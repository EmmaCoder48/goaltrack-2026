import Link from 'next/link';
import { query } from '@/lib/db';

async function getPosiciones() {
  try {
    const equipos = await query<any>(`
      SELECT e.Id_equipo, e.Nombre, e.Bandera, e.Grupo,
        COUNT(CASE WHEN p.Goles_local IS NOT NULL THEN 1 END) AS pj,
        COUNT(CASE WHEN p.Goles_local > p.Goles_visitante THEN 1 END) AS pg,
        COUNT(CASE WHEN p.Goles_local = p.Goles_visitante AND p.Goles_local IS NOT NULL THEN 1 END) AS pe,
        COUNT(CASE WHEN p.Goles_local < p.Goles_visitante THEN 1 END) AS pp,
        COALESCE(SUM(p.Goles_local),0) AS gf,
        COALESCE(SUM(p.Goles_visitante),0) AS gc,
        COALESCE(SUM(CASE WHEN p.Goles_local > p.Goles_visitante THEN 3 WHEN p.Goles_local = p.Goles_visitante AND p.Goles_local IS NOT NULL THEN 1 ELSE 0 END),0) AS pts
      FROM Equipo e LEFT JOIN Partido p ON p.Id_equipo_local = e.Id_equipo
      GROUP BY e.Id_equipo, e.Nombre, e.Bandera, e.Grupo
      UNION ALL
      SELECT e.Id_equipo, e.Nombre, e.Bandera, e.Grupo,
        COUNT(CASE WHEN p.Goles_visitante IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN p.Goles_visitante > p.Goles_local THEN 1 END),
        COUNT(CASE WHEN p.Goles_visitante = p.Goles_local AND p.Goles_visitante IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN p.Goles_visitante < p.Goles_local THEN 1 END),
        COALESCE(SUM(p.Goles_visitante),0),
        COALESCE(SUM(p.Goles_local),0),
        COALESCE(SUM(CASE WHEN p.Goles_visitante > p.Goles_local THEN 3 WHEN p.Goles_visitante = p.Goles_local AND p.Goles_visitante IS NOT NULL THEN 1 ELSE 0 END),0)
      FROM Equipo e LEFT JOIN Partido p ON p.Id_equipo_visitante = e.Id_equipo
      GROUP BY e.Id_equipo, e.Nombre, e.Bandera, e.Grupo
    `);

    const map = new Map<number, any>();
    for (const row of equipos) {
      const id = row.id_equipo;
      if (!map.has(id)) map.set(id, { ...row, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      const e = map.get(id)!;
      e.pj += parseInt(row.pj); e.pg += parseInt(row.pg); e.pe += parseInt(row.pe);
      e.pp += parseInt(row.pp); e.gf += parseInt(row.gf); e.gc += parseInt(row.gc);
      e.pts += parseInt(row.pts);
    }

    return Array.from(map.values())
      .map(e => ({ ...e, dg: e.gf - e.gc }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  } catch { return []; }
}

function FlagServer({ bandera, nombre }: { bandera: string | null; nombre: string }) {
  if (!bandera) return <span>🏳️</span>;
  if (bandera.startsWith('http')) return <img src={bandera} alt={nombre} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />;
  return <span>{bandera}</span>;
}

export default async function PosicionesPage() {
  const posiciones = await getPosiciones();

  const porGrupo = posiciones.reduce((acc: Record<string, typeof posiciones>, e) => {
    const g = e.grupo || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(e);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2>TABLA DE POSICIONES</h2>
          <p>Clasificación por puntos en el torneo</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/reportes/calendario" className="btn btn-secondary btn-sm">Calendario</Link>
          <Link href="/reportes/resultados" className="btn btn-secondary btn-sm">Quinielas</Link>
        </div>
      </div>

      {posiciones.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <p>Sin datos de partidos todavía.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(porGrupo).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, items]) => (
            <div key={grupo} className="card">
              <div className="card-header">
                <h3>Grupo {grupo}</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Equipo</th>
                      <th style={{ textAlign: 'center' }}>PJ</th>
                      <th style={{ textAlign: 'center' }}>PG</th>
                      <th style={{ textAlign: 'center' }}>PE</th>
                      <th style={{ textAlign: 'center' }}>PP</th>
                      <th style={{ textAlign: 'center' }}>GF</th>
                      <th style={{ textAlign: 'center' }}>GC</th>
                      <th style={{ textAlign: 'center' }}>DG</th>
                      <th style={{ textAlign: 'center' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((e: any, i: number) => (
                      <tr key={e.id_equipo} style={i < 2 ? { background: 'rgba(0,166,81,0.04)' } : {}}>
                        <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: i < 2 ? 'var(--verde)' : 'var(--gris)' }}>
                          {i + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FlagServer bandera={e.bandera} nombre={e.nombre} />
                            <span style={{ fontWeight: 600 }}>{e.nombre}</span>
                            {i < 2 && <span className="badge badge-verde" style={{ fontSize: '0.6rem' }}>Clasifica</span>}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{e.pj}</td>
                        <td style={{ textAlign: 'center' }}>{e.pg}</td>
                        <td style={{ textAlign: 'center' }}>{e.pe}</td>
                        <td style={{ textAlign: 'center' }}>{e.pp}</td>
                        <td style={{ textAlign: 'center' }}>{e.gf}</td>
                        <td style={{ textAlign: 'center' }}>{e.gc}</td>
                        <td style={{ textAlign: 'center', color: e.dg > 0 ? 'var(--verde)' : e.dg < 0 ? 'var(--rojo)' : 'inherit' }}>
                          {e.dg > 0 ? '+' : ''}{e.dg}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontSize: '1.2rem',
                            color: 'var(--negro)',
                          }}>{e.pts}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
