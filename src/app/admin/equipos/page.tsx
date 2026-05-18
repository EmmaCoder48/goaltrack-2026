'use client';
import { useState, useEffect } from 'react';

interface Equipo {
  id_equipo: number;
  nombre: string;
  bandera: string | null;
  grupo: string | null;
}

const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function AdminEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Equipo | null>(null);
  const [form, setForm] = useState({ nombre: '', bandera: '', grupo: '' });
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);

  const cargar = async () => {
    setLoading(true);
    const r = await fetch('/api/equipos');
    setEquipos(await r.json());
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (e?: Equipo) => {
    setEditando(e || null);
    setForm(e ? { nombre: e.nombre, bandera: e.bandera || '', grupo: e.grupo || '' } : { nombre: '', bandera: '', grupo: '' });
    setModal(true);
    setMsg(null);
  };

  const guardar = async () => {
    const method = editando ? 'PUT' : 'POST';
    const url = editando ? `/api/equipos/${editando.id_equipo}` : '/api/equipos';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: form.nombre, bandera: form.bandera || null, grupo: form.grupo || null }),
    });
    const data = await r.json();
    if (!r.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setModal(false);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
    cargar();
  };

  // Agrupar por grupo
  const porGrupo = equipos.reduce((acc, e) => {
    const g = e.grupo || 'Sin Grupo';
    if (!acc[g]) acc[g] = [];
    acc[g].push(e);
    return acc;
  }, {} as Record<string, Equipo[]>);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2>EQUIPOS</h2>
          <p>Administrar equipos participantes</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Equipo</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(porGrupo).sort(([a], [b]) => a.localeCompare(b)).map(([grupo, items]) => (
            <div key={grupo} className="card">
              <div className="card-header">
                <h3>Grupo {grupo}</h3>
                <span className="badge badge-verde">{items.length} equipos</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Bandera</th>
                      <th>Nombre</th>
                      <th>Grupo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((e) => (
                      <tr key={e.id_equipo}>
                        <td style={{ fontSize: '1.5rem' }}>
                          {e.bandera ? (
                            e.bandera.startsWith('http') ? (
                              <img src={e.bandera} alt="" style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 2 }} />
                            ) : e.bandera
                          ) : '🏳️'}
                        </td>
                        <td style={{ fontWeight: 600 }}>{e.nombre}</td>
                        <td>{e.grupo ? <span className="badge badge-azul">{e.grupo}</span> : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => abrirModal(e)}>Editar</button>
                            <button className="btn btn-sm btn-danger" onClick={() => eliminar(e.id_equipo)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {equipos.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <p>No hay equipos registrados. Agrega el primero.</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
              <div className="form-group">
                <label className="form-label">Nombre del Equipo *</label>
                <input className="form-control" value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Guatemala" />
              </div>
              <div className="form-group">
                <label className="form-label">Bandera (URL o emoji)</label>
                <input className="form-control" value={form.bandera}
                  onChange={e => setForm(f => ({ ...f, bandera: e.target.value }))}
                  placeholder="🇬🇹 o https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Grupo</label>
                <select className="form-control" value={form.grupo}
                  onChange={e => setForm(f => ({ ...f, grupo: e.target.value }))}>
                  <option value="">Sin grupo</option>
                  {GRUPOS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>
                {editando ? 'Guardar Cambios' : 'Crear Equipo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
