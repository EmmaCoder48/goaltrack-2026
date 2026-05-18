'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Usuario { id_usuario: number; nombre: string; username: string; }
interface Fase { id_fase: number; nombre: string; }
interface Partido {
  id_partido: number;
  id_fase: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha_hora: string;
  local_nombre: string;
  local_bandera: string | null;
  visitante_nombre: string;
  visitante_bandera: string | null;
  fase_nombre: string;
}
interface Quinela {
  id_quinela: number;
  id_partido: number;
  pred_local: number;
  pred_visitante: number;
  puntos: number;
}

function FlagDisplay({ b, n }: { b: string | null; n: string }) {
  if (!b) return <span style={{ fontSize: '1.4rem' }}>🏳️</span>;
  if (b.startsWith('http')) return <img src={b} alt={n} style={{ width: 28, height: 18, objectFit: 'cover', borderRadius: 3 }} />;
  return <span style={{ fontSize: '1.4rem' }}>{b}</span>;
}

export default function Quinielas() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [quinielas, setQuinielas] = useState<Quinela[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedFase, setSelectedFase] = useState('');
  const [predicciones, setPredicciones] = useState<Record<number, { local: string; visitante: string }>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);

  useEffect(() => {
    fetch('/api/usuarios').then(r => r.json()).then(setUsuarios);
    fetch('/api/fases').then(r => r.json()).then(d => { setFases(d); if (d[0]) setSelectedFase(d[0].id_fase.toString()); });
  }, []);

  useEffect(() => {
    if (selectedFase) fetch(`/api/partidos?fase=${selectedFase}`).then(r => r.json()).then(setPartidos);
  }, [selectedFase]);

  useEffect(() => {
    if (selectedUser && selectedFase) {
      fetch(`/api/quinielas?usuario=${selectedUser.id_usuario}&fase=${selectedFase}`)
        .then(r => r.json())
        .then((qs: any[]) => {
          setQuinielas(qs);
          const preds: Record<number, { local: string; visitante: string }> = {};
          for (const q of qs) {
            preds[q.id_partido] = { local: q.pred_local.toString(), visitante: q.pred_visitante.toString() };
          }
          setPredicciones(preds);
        });
    }
  }, [selectedUser, selectedFase]);

  const guardarQuinielas = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMsg(null);
    let guardados = 0;
    let errores = 0;

    for (const [id_partido, pred] of Object.entries(predicciones)) {
      if (pred.local === '' || pred.visitante === '') continue;
      const partido = partidos.find(p => p.id_partido === parseInt(id_partido));
      if (!partido || new Date(partido.fecha_hora) < new Date()) continue;

      const r = await fetch('/api/quinielas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: selectedUser.id_usuario,
          id_partido: parseInt(id_partido),
          pred_local: parseInt(pred.local),
          pred_visitante: parseInt(pred.visitante),
        }),
      });
      if (r.ok) guardados++;
      else errores++;
    }

    setSaving(false);
    setMsg({
      tipo: errores === 0 ? 'success' : 'warning',
      texto: `${guardados} quiniela(s) guardadas${errores > 0 ? `, ${errores} error(es)` : ''}`,
    });

    // Recargar quinielas
    fetch(`/api/quinielas?usuario=${selectedUser.id_usuario}&fase=${selectedFase}`)
      .then(r => r.json()).then(setQuinielas);
  };

  const partidosPendientes = partidos.filter(p => new Date(p.fecha_hora) > new Date());
  const partidosJugados = partidos.filter(p => p.goles_local !== null);

  return (
    <div>
      <div className="page-header">
        <h2>QUINIELAS</h2>
        <p>Ingresa tus predicciones para los partidos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        {/* Panel izquierdo: selector usuario/fase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3>Participante</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Seleccionar usuario</label>
                <select className="form-control" value={selectedUser?.id_usuario || ''}
                  onChange={e => {
                    const u = usuarios.find(u => u.id_usuario === parseInt(e.target.value));
                    setSelectedUser(u || null);
                    setMsg(null);
                  }}>
                  <option value="">— Elige tu perfil —</option>
                  {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                </select>
              </div>
              {selectedUser && (
                <div style={{ background: 'var(--gris-claro)', borderRadius: 8, padding: '10px 12px', marginTop: 4 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{selectedUser.nombre}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gris)' }}>@{selectedUser.username}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Fase</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {fases.map(f => (
                <button key={f.id_fase}
                  onClick={() => { setSelectedFase(f.id_fase.toString()); setMsg(null); }}
                  style={{
                    display: 'block', width: '100%', padding: '12px 20px',
                    background: selectedFase === f.id_fase.toString() ? 'rgba(0,166,81,0.1)' : 'transparent',
                    borderLeft: `3px solid ${selectedFase === f.id_fase.toString() ? 'var(--verde)' : 'transparent'}`,
                    border: 'none', borderBottom: '1px solid var(--gris-claro)',
                    textAlign: 'left', cursor: 'pointer',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: '0.95rem',
                    color: selectedFase === f.id_fase.toString() ? 'var(--verde-dark)' : 'var(--gris-dark)',
                  }}>
                  {f.nombre}
                </button>
              ))}
            </div>
          </div>

          <Link href="/quinielas/registro" className="btn btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
            👤 Registrarse
          </Link>
        </div>

        {/* Panel derecho: partidos */}
        <div>
          {!selectedUser ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <p>Selecciona tu perfil para ver e ingresar tus quinielas</p>
              </div>
            </div>
          ) : (
            <>
              {msg && <div className={`alert alert-${msg.tipo}`} style={{ marginBottom: 16 }}>{msg.texto}</div>}

              {/* Partidos Pendientes */}
              {partidosPendientes.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header">
                    <h3>Partidos Disponibles</h3>
                    <span className="badge badge-verde">{partidosPendientes.length} pendientes</span>
                  </div>
                  <div style={{ padding: '8px 16px 0' }}>
                    <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                      Ingresa tu predicción antes de que empiece cada partido.
                    </div>
                  </div>
                  {partidosPendientes.map(p => {
                    const pred = predicciones[p.id_partido] || { local: '', visitante: '' };
                    return (
                      <div key={p.id_partido} style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--gris-claro)',
                        display: 'flex', alignItems: 'center', gap: 16,
                      }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FlagDisplay b={p.local_bandera} n={p.local_nombre} />
                          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.local_nombre}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" min="0" max="99"
                            className="form-control"
                            style={{ width: 56, textAlign: 'center', padding: '8px 4px' }}
                            value={pred.local}
                            onChange={e => setPredicciones(pr => ({ ...pr, [p.id_partido]: { ...pred, local: e.target.value } }))}
                          />
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: 'var(--gris)' }}>-</span>
                          <input type="number" min="0" max="99"
                            className="form-control"
                            style={{ width: 56, textAlign: 'center', padding: '8px 4px' }}
                            value={pred.visitante}
                            onChange={e => setPredicciones(pr => ({ ...pr, [p.id_partido]: { ...pred, visitante: e.target.value } }))}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.visitante_nombre}</span>
                          <FlagDisplay b={p.visitante_bandera} n={p.visitante_nombre} />
                        </div>
                        <div style={{ minWidth: 90, textAlign: 'right', fontSize: '0.75rem', color: 'var(--gris)' }}>
                          {new Date(p.fecha_hora).toLocaleString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding: '16px 20px' }}>
                    <button className="btn btn-primary" onClick={guardarQuinielas} disabled={saving}>
                      {saving ? 'Guardando...' : '💾 Guardar Predicciones'}
                    </button>
                  </div>
                </div>
              )}

              {/* Partidos jugados con resultado */}
              {partidosJugados.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3>Partidos Jugados</h3>
                    <span className="badge badge-gris">{partidosJugados.length}</span>
                  </div>
                  {partidosJugados.map(p => {
                    const q = quinielas.find(q => q.id_partido === p.id_partido);
                    return (
                      <div key={p.id_partido} style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--gris-claro)',
                        display: 'flex', alignItems: 'center', gap: 16,
                        opacity: 0.85,
                      }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FlagDisplay b={p.local_bandera} n={p.local_nombre} />
                          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.local_nombre}</span>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 120 }}>
                          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', letterSpacing: 3 }}>
                            {p.goles_local} - {p.goles_visitante}
                          </div>
                          {q && (
                            <div style={{ fontSize: '0.75rem' }}>
                              Tu pred: <strong>{q.pred_local}-{q.pred_visitante}</strong>
                              <span style={{ marginLeft: 6 }} className={`badge ${q.puntos > 0 ? 'badge-verde' : 'badge-gris'}`}>
                                {q.puntos} pts
                              </span>
                            </div>
                          )}
                          {!q && <div style={{ fontSize: '0.72rem', color: 'var(--gris)' }}>Sin predicción</div>}
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{p.visitante_nombre}</span>
                          <FlagDisplay b={p.visitante_bandera} n={p.visitante_nombre} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {partidos.length === 0 && (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p>No hay partidos en esta fase todavía.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
