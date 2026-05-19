'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState<{ tipo: string; texto: string } | null>(null);
  const router = useRouter();

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!form.username.trim() || !form.password) {
      setMsg({ tipo: 'error', texto: 'Por favor, ingresa usuario y contraseña' });
      return;
    }

    try {
      // Llamamos a la ruta de tu API que ya tienes creada
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await r.json();

      if (!r.ok) {
        setMsg({ tipo: 'error', texto: data.error || 'Credenciales incorrectas' });
        return;
      }

      // Si el login es exitoso, redirigimos al dashboard (o la página principal)
      router.push('/'); 
      
    } catch (error) {
      setMsg({ tipo: 'error', texto: 'Error al conectar con el servidor' });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h2>INICIAR SESIÓN</h2>
        <p>Ingresa a tu cuenta de Quiniela Mundial 2026</p>
      </div>

      <div className="card">
        <div className="card-body">
          {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
          
          <form onSubmit={iniciarSesion}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Tu usuario" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="******" 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              Entrar
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/quinielas/registro" style={{ color: 'var(--verde)', fontSize: '0.9rem' }}>
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
