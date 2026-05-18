'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegistroPage() {
  const [form, setForm] = useState({ nombre: '', username: '', password: '', confirmar: '' });
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);
  const [done, setDone] = useState(false);

  const registrar = async () => {
    setMsg(null);
    if (!form.nombre.trim() || !form.username.trim() || !form.password) {
      setMsg({ tipo: 'error', texto: 'Todos los campos son requeridos' }); return;
    }
    if (form.password !== form.confirmar) {
      setMsg({ tipo: 'error', texto: 'Las contraseñas no coinciden' }); return;
    }
    if (form.password.length < 4) {
      setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 4 caracteres' }); return;
    }

    const r = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: form.nombre, username: form.username, password: form.password }),
    });
    const data = await r.json();
    if (!r.ok) { setMsg({ tipo: 'error', texto: data.error }); return; }
    setDone(true);
  };

  if (done) return (
    <div style={{ maxWidth: 480, margin: '60px auto' }}>
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: 2, marginBottom: 8 }}>
            ¡REGISTRO EXITOSO!
          </h3>
          <p style={{ color: 'var(--gris)', marginBottom: 24 }}>
            Ya puedes ingresar tus quinielas con el usuario <strong>@{form.username}</strong>
          </p>
          <Link href="/quinielas" className="btn btn-primary">Ir a Quinielas</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <div className="page-header">
        <h2>REGISTRARSE</h2>
        <p>Crea tu perfil para participar en las quinielas</p>
      </div>
      <div className="card">
        <div className="card-body">
          {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input className="form-control" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Tu nombre completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input className="form-control" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Ej: juan123" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input type="password" className="form-control" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar Contraseña *</label>
            <input type="password" className="form-control" value={form.confirmar}
              onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={registrar} style={{ width: '100%', justifyContent: 'center' }}>
            Crear Cuenta
          </button>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/quinielas" style={{ color: 'var(--verde)', fontSize: '0.9rem' }}>
              Ya tengo cuenta → Ir a Quinielas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
