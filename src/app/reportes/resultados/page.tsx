'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Resultado {
  id_usuario: number;
  usuario_nombre: string;
  id_fase: number;
  fase_nombre: string;
  quinielas: number;
  total_puntos: number;
}

interface Fase { id_fase: number; nombre: string; }

export default function ResultadosPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [filtroFase, setFiltroFase] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fases').then(r => r.json()).then(setFases);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = filtroFase ? `/api/reportes/resultados?fase=${filtroFase}` : '/api/reportes/resultados';
    fetch(url).then(r => r.json()).then(d => { setResultados(d); setLoading(false); });
  }, [filtroFase]);

  // Agrupar por fase para mostrar clasificación por fase
  const porFase = resultados.reduce((acc: Record<string, Resultado[]>, r) => {
    const f = r.fase_nombre || 'General';
    if (!acc[f]) acc[f] = [];
    acc[f].push(r);
    return acc;
  }, {});

  // Clasificación global: sumar puntos por usuario
  const global = Object.values(
    resultados.reduce((acc: Record<number, { id: number; nombre: string; pts: number; quinielas: number }>, r) => {
      if (!acc[r.id_usuario]) acc[r.id_usuario] = { id: r.id_usuario, nombre: r.usuario_nombre, pts: 0, quinielas: 0 };
      acc[r.id_usuario].pts += parseInt(r.total_puntos as any);
      acc[r.id_usuario].quinielas += parseInt(r.quinielas as any);
      return acc;
    }, {})
  ).sort((a, b) => b.pts - a.pts);

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>RESULTADOS DE QUINIELAS</h2>
          <p>Puntuación por participante y fase</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto' }} value={filtroFase} onChange={e => setFiltroFase(e.target.value)}>
            <option value="">Todas las fases</option>
            {fases.map(f => <option key={f.id_fase} value={f.id_fase}>{f.nombre}</option>)}
          </select>
          <Link href="/reportes/calendario" className="btn btn-secondary btn-sm">Calendario</Link>
          <Link href="/reportes/posiciones" className="btn btn-secondary btn-sm">Posiciones</Link>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Cargando...</div>
      ) : resultados.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Aún no hay quinielas con resultados.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Clasificación Global */}
          {!filtroFase && global.length > 0 && (
            <div className="card">
              <div className="card-header" style={{ background: 'var(--negro)' }}>
                <h3 style={{ color: 'var(--dorado)' }}>🏆 CLASIFICACIÓN GENERAL</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Participante</th>
                      <th style={{ textAlign: 'center' }}>Quinielas</th>
                      <th style={{ textAlign: 'center' }}>Puntos Totales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {global.map((u, i) => (
                      <tr key={u.id} style={i === 0 ? { background: 'rgba(245,166,35,0.08)' } : {}}>
                        <td style={{ fontSize: '1.3rem' }}>{MEDALS[i] || (i + 1)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: `hsl(${(u.id * 47) % 360}, 60%, 45%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                            }}>
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--gris)' }}>{u.quinielas}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: i === 0 ? 'var(--dorado)' : 'var(--negro)' }}>
                            {u.pts}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gris)', marginLeft: 4 }}>pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Por Fase */}
          {Object.entries(porFase).map(([fase, items]) => (
            <div key={fase} className="card">
              <div className="card-header">
                <h3>{fase}</h3>
                <span className="badge badge-gris">{items.length} participantes</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Participante</th>
                      <th style={{ textAlign: 'center' }}>Quinielas</th>
                      <th style={{ textAlign: 'center' }}>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.sort((a, b) => b.total_puntos - a.total_puntos).map((r, i) => (
                      <tr key={r.id_usuario}>
                        <td style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, color: 'var(--gris)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.usuario_nombre}</td>
                        <td style={{ textAlign: 'center', color: 'var(--gris)' }}>{r.quinielas}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${r.total_puntos > 0 ? 'badge-verde' : 'badge-gris'}`} style={{ fontSize: '0.85rem' }}>
                            {r.total_puntos} pts
                          </span>
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
