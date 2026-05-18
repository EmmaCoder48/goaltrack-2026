'use client';
import { useState, useEffect } from 'react';

interface Fase { id_fase: number; nombre: string; }

export default function AdminFases() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Fase | null>(null);
  const [nombre, setNombre] = useState('');
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);

  const cargar = async () => {
    setLoading(true);
    const r = await fetch('/api/fases');
    setFases(await r.json());
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (f?: Fase) => {
    setEditando(f || null);
    setNombre(f?.nombre || '');
    setModal(true);
    setMsg(null);
  };

  const guardar = async () => {
    if (!nombre.trim()) { setMsg({ tipo: 'error', texto: 'El nombre es requerido' }); return; }
    const method = editando ? 'PUT' : 'POST';
    const url = editando ? `/api/fases/${editando.id_fase}` : '/api/fases';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });
    const data = await r.json();
    if (!r.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setModal(false);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta fase? Se eliminarán sus partidos.')) return;
    await fetch(`/api/fases/${id}`, { method: 'DELETE' });
    cargar();
  };

  const FASE_ICONS: Record<string, string> = {
    'Grupos': '🏟️',
    'Octavos': '⚔️',
    'Cuartos': '🥇',
    'Semifinal': '🔥',
    'Final': '🏆',
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2>FASES DEL TORNEO</h2>
          <p>Grupos, Octavos, Cuartos de Final, etc.</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nueva Fase</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Cargando...</div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fase</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fases.map((f) => (
                  <tr key={f.id_fase}>
                    <td style={{ color: 'var(--gris)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                      {f.id_fase}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.3rem' }}>
                          {Object.entries(FASE_ICONS).find(([k]) => f.nombre.toLowerCase().includes(k.toLowerCase()))?.[1] || '🔖'}
                        </span>
                        <span style={{ fontWeight: 600 }}>{f.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => abrirModal(f)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => eliminar(f.id_fase)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fases.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <p>No hay fases creadas. Crea Grupos, Octavos, etc.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Fase' : 'Nueva Fase'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
              <div className="form-group">
                <label className="form-label">Nombre de la Fase *</label>
                <input className="form-control" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Grupos, Octavos de Final, Final..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>
                {editando ? 'Guardar Cambios' : 'Crear Fase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
