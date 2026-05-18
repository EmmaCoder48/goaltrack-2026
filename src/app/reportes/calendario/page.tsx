import Link from 'next/link';
import { query } from '@/lib/db';

async function getCalendario() {
  try {
    return await query<any>(`
      SELECT p.*,
        e1.Nombre AS local_nombre, e1.Bandera AS local_bandera,
        e2.Nombre AS visitante_nombre, e2.Bandera AS visitante_bandera,
        f.Nombre AS fase_nombre
      FROM Partido p
      LEFT JOIN Equipo e1 ON p.Id_equipo_local = e1.Id_equipo
      LEFT JOIN Equipo e2 ON p.Id_equipo_visitante = e2.Id_equipo
      JOIN Fase f ON p.Id_fase = f.Id_fase
      ORDER BY p.Fecha_Hora ASC
    `);
  } catch { return []; }
}

function FlagServer({ bandera, nombre }: { bandera: string | null; nombre: string }) {
  if (!bandera) return <span style={{ fontSize: '1.5rem' }}>🏳️</span>;
  if (bandera.startsWith('http')) return <img src={bandera} alt={nombre} style={{ width: 28, height: 18, objectFit: 'cover', borderRadius: 3 }} />;
  return <span style={{ fontSize: '1.5rem' }}>{bandera}</span>;
}

export default async function CalendarioPage() {
  const partidos = await getCalendario();

  const porFase = partidos.reduce((acc: Record<string, typeof partidos>, p) => {
    if (!acc[p.fase_nombre]) acc[p.fase_nombre] = [];
    acc[p.fase_nombre].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2>CALENDARIO DE PARTIDOS</h2>
          <p>Todos los partidos del torneo</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/reportes/posiciones" className="btn btn-secondary btn-sm">Tabla de Posiciones</Link>
          <Link href="/reportes/resultados" className="btn btn-secondary btn-sm">Quinielas</Link>
        </div>
      </div>

      {partidos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No hay partidos programados todavía.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(porFase).map(([fase, items]) => (
            <div key={fase}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.4rem',
                letterSpacing: 3,
                color: 'var(--negro)',
                marginBottom: 12,
                paddingBottom: 6,
                borderBottom: '3px solid var(--verde)',
              }}>
                {fase}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
                {items.map((p: any) => {
                  const jugado = p.goles_local !== null && p.goles_visitante !== null;
                  const empezado = new Date(p.fecha_hora) < new Date();
                  return (
                    <Link key={p.id_partido} href={`/admin/equipos`}
                      style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '16px 20px',
                        transition: 'box-shadow 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--gris)', fontFamily: 'Barlow Condensed', letterSpacing: 1 }}>
                            {new Date(p.fecha_hora).toLocaleString('es-GT', {
                              weekday: 'short', day: 'numeric', month: 'short',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          {jugado ? (
                            <span className="badge badge-verde">Finalizado</span>
                          ) : empezado ? (
                            <span className="badge badge-dorado">En Juego</span>
                          ) : (
                            <span className="badge badge-gris">Programado</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FlagServer bandera={p.local_bandera} nombre={p.local_nombre} />
                            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.local_nombre}</span>
                          </div>
                          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: 3, minWidth: 60, textAlign: 'center' }}>
                            {jugado ? `${p.goles_local} - ${p.goles_visitante}` : 'VS'}
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.visitante_nombre}</span>
                            <FlagServer bandera={p.visitante_bandera} nombre={p.visitante_nombre} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
