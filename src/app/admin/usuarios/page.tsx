'use client';
import { useState, useEffect } from 'react';

interface Usuario { id_usuario: number; nombre: string; username: string; }

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', username: '', password: '' });
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);

  const cargar = async () => {
    setLoading(true);
    const r = await fetch('/api/usuarios');
    setUsuarios(await r.json());
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (u?: Usuario) => {
    setEditando(u || null);
    setForm(u ? { nombre: u.nombre, username: u.username, password: '' } : { nombre: '', username: '', password: '' });
    setModal(true);
    setMsg(null);
  };

  const guardar = async () => {
    const method = editando ? 'PUT' : 'POST';
    const url = editando ? `/api/usuarios/${editando.id_usuario}` : '/api/usuarios';
    const body: any = { nombre: form.nombre, username: form.username };
    if (!editando || form.password) body.password = form.password;
    if (!editando && !form.password) { setMsg({ tipo: 'error', texto: 'La contraseña es requerida' }); return; }

    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setModal(false);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este usuario? Se eliminarán sus quinielas.')) return;
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    cargar();
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2>USUARIOS</h2>
          <p>Participantes del sistema de quinielas</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Usuario</button>
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
                  <th>Nombre</th>
                  <th>Username</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td style={{ color: 'var(--gris)', fontFamily: 'Barlow Condensed' }}>{u.id_usuario}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: '50%',
                          background: `hsl(${(u.id_usuario * 47) % 360}, 60%, 45%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.85rem',
                          flexShrink: 0,
                        }}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: 'var(--gris-claro)', padding: '2px 8px', borderRadius: 4 }}>
                        @{u.username}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => abrirModal(u)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => eliminar(u.id_usuario)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No hay usuarios registrados.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input className="form-control" value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-control" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{editando ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                <input type="password" className="form-control" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>
                {editando ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
