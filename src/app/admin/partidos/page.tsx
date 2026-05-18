'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Equipo { id_equipo: number; nombre: string; bandera: string | null; grupo: string | null; }
interface Fase { id_fase: number; nombre: string; }
interface Partido {
  id_partido: number;
  id_fase: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha_hora: string;
  local_nombre: string;
  local_bandera: string | null;
  visitante_nombre: string;
  visitante_bandera: string | null;
  fase_nombre: string;
}

function FlagDisplay({ bandera, nombre }: { bandera: string | null; nombre: string }) {
  if (!bandera) return <span>🏳️</span>;
  if (bandera.startsWith('http')) return <img src={bandera} alt={nombre} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />;
  return <span>{bandera}</span>;
}

export default function AdminPartidos() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalResultado, setModalResultado] = useState<Partido | null>(null);
  const [filtroFase, setFiltroFase] = useState('');
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);

  const [form, setForm] = useState({
    id_fase: '', id_equipo_local: '', id_equipo_visitante: '', fecha_hora: '',
  });
  const [resultado, setResultado] = useState({ goles_local: '', goles_visitante: '' });

  const cargar = async () => {
    setLoading(true);
    const [pRes, eRes, fRes] = await Promise.all([
      fetch('/api/partidos'),
      fetch('/api/equipos'),
      fetch('/api/fases'),
    ]);
    setPartidos(await pRes.json());
    setEquipos(await eRes.json());
    setFases(await fRes.json());
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crearPartido = async () => {
    if (!form.id_fase || !form.id_equipo_local || !form.id_equipo_visitante || !form.fecha_hora) {
      setMsg({ tipo: 'error', texto: 'Todos los campos son requeridos' }); return;
    }
    const r = await fetch('/api/partidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_fase: parseInt(form.id_fase),
        id_equipo_local: parseInt(form.id_equipo_local),
        id_equipo_visitante: parseInt(form.id_equipo_visitante),
        fecha_hora: form.fecha_hora,
      }),
    });
    const data = await r.json();
    if (!r.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setModalCrear(false);
    cargar();
  };

  const guardarResultado = async () => {
    if (!modalResultado) return;
    const gl = parseInt(resultado.goles_local);
    const gv = parseInt(resultado.goles_visitante);
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) {
      setMsg({ tipo: 'error', texto: 'Ingresa goles válidos' }); return;
    }
    const r = await fetch(`/api/partidos/${modalResultado.id_partido}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goles_local: gl,
        goles_visitante: gv,
        id_fase: modalResultado.id_fase,
        id_equipo_local: modalResultado.id_equipo_local,
        id_equipo_visitante: modalResultado.id_equipo_visitante,
        fecha_hora: modalResultado.fecha_hora,
      }),
    });
    if (!r.ok) { const d = await r.json(); setMsg({ tipo: 'error', texto: d.error }); return; }
    setModalResultado(null);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este partido?')) return;
    await fetch(`/api/partidos/${id}`, { method: 'DELETE' });
    cargar();
  };

  const filtrados = filtroFase
    ? partidos.filter(p => p.id_fase === parseInt(filtroFase))
    : partidos;

  // Agrupar por fase
  const porFase = filtrados.reduce((acc, p) => {
    if (!acc[p.fase_nombre]) acc[p.fase_nombre] = [];
    acc[p.fase_nombre].push(p);
    return acc;
  }, {} as Record<string, Partido[]>);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>PARTIDOS</h2>
          <p>Calendario y resultados del torneo</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto' }} value={filtroFase} onChange={e => setFiltroFase(e.target.value)}>
            <option value="">Todas las fases</option>
            {fases.map(f => <option key={f.id_fase} value={f.id_fase}>{f.nombre}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setModalCrear(true); setMsg(null); setForm({ id_fase: '', id_equipo_local: '', id_equipo_visitante: '', fecha_hora: '' }); }}>
            + Nuevo Partido
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(porFase).map(([fase, items]) => (
            <div key={fase} className="card">
              <div className="card-header">
                <h3>{fase}</h3>
                <span className="badge badge-gris">{items.length} partidos</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Local</th>
                      <th>Resultado</th>
                      <th>Visitante</th>
                      <th>Fecha / Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => {
                      const jugado = p.goles_local !== null && p.goles_visitante !== null;
                      const empezado = new Date(p.fecha_hora) < new Date();
                      return (
                        <tr key={p.id_partido}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FlagDisplay bandera={p.local_bandera} nombre={p.local_nombre} />
                              <span style={{ fontWeight: 600 }}>{p.local_nombre}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {jugado ? (
                              <span style={{
                                fontFamily: 'Bebas Neue, sans-serif',
                                fontSize: '1.3rem',
                                letterSpacing: 2,
                                color: 'var(--negro)'
                              }}>
                                {p.goles_local} - {p.goles_visitante}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--gris)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>VS</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FlagDisplay bandera={p.visitante_bandera} nombre={p.visitante_nombre} />
                              <span style={{ fontWeight: 600 }}>{p.visitante_nombre}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--gris)' }}>
                            {new Date(p.fecha_hora).toLocaleString('es-GT', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td>
                            {jugado ? (
                              <span className="badge badge-verde">Jugado</span>
                            ) : empezado ? (
                              <span className="badge badge-dorado">En Curso</span>
                            ) : (
                              <span className="badge badge-gris">Pendiente</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-gold"
                                onClick={() => {
                                  setModalResultado(p);
                                  setResultado({
                                    goles_local: p.goles_local?.toString() || '',
                                    goles_visitante: p.goles_visitante?.toString() || ''
                                  });
                                  setMsg(null);
                                }}>
                                Resultado
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => eliminar(p.id_partido)}>✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No hay partidos. Crea el primero para empezar.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Partido */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Partido</h3>
              <button className="modal-close" onClick={() => setModalCrear(false)}>✕</button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
              <div className="form-group">
                <label className="form-label">Fase *</label>
                <select className="form-control" value={form.id_fase} onChange={e => setForm(f => ({ ...f, id_fase: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {fases.map(f => <option key={f.id_fase} value={f.id_fase}>{f.nombre}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Equipo Local *</label>
                  <select className="form-control" value={form.id_equipo_local} onChange={e => setForm(f => ({ ...f, id_equipo_local: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {equipos.map(e => <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Equipo Visitante *</label>
                  <select className="form-control" value={form.id_equipo_visitante} onChange={e => setForm(f => ({ ...f, id_equipo_visitante: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {equipos.filter(e => e.id_equipo.toString() !== form.id_equipo_local).map(e => (
                      <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha y Hora *</label>
                <input type="datetime-local" className="form-control" value={form.fecha_hora}
                  onChange={e => setForm(f => ({ ...f, fecha_hora: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalCrear(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={crearPartido}>Crear Partido</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resultado */}
      {modalResultado && (
        <div className="modal-overlay" onClick={() => setModalResultado(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ingresar Resultado</h3>
              <button className="modal-close" onClick={() => setModalResultado(null)}>✕</button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                  {modalResultado.local_nombre} vs {modalResultado.visitante_nombre}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gris)' }}>
                  {new Date(modalResultado.fecha_hora).toLocaleString('es-GT')}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Goles {modalResultado.local_nombre}</label>
                  <input type="number" min="0" className="form-control" value={resultado.goles_local}
                    onChange={e => setResultado(r => ({ ...r, goles_local: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Goles {modalResultado.visitante_nombre}</label>
                  <input type="number" min="0" className="form-control" value={resultado.goles_visitante}
                    onChange={e => setResultado(r => ({ ...r, goles_visitante: e.target.value }))} />
                </div>
              </div>
              <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                Al guardar el resultado se calcularán automáticamente los puntos de todas las quinielas de este partido.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalResultado(null)}>Cancelar</button>
              <button className="btn btn-gold" onClick={guardarResultado}>Guardar Resultado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
