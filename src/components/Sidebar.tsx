'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  {
    section: 'Principal',
    links: [
      { href: '/', label: 'Dashboard', icon: '⚽' },
    ],
  },
  {
    section: 'Quinielas',
    links: [
      { href: '/quinielas', label: 'Mis Quinielas', icon: '🎯' },
      { href: '/quinielas/registro', label: 'Registrarse', icon: '👤' },
    ],
  },
  {
    section: 'Reportes',
    links: [
      { href: '/reportes/calendario', label: 'Calendario', icon: '📅' },
      { href: '/reportes/posiciones', label: 'Tabla de Posiciones', icon: '🏆' },
      { href: '/reportes/resultados', label: 'Resultados Quinielas', icon: '📊' },
    ],
  },
  {
    section: 'Administración',
    links: [
      { href: '/admin/fases', label: 'Fases', icon: '🔖' },
      { href: '/admin/equipos', label: 'Equipos', icon: '🌍' },
      { href: '/admin/partidos', label: 'Partidos', icon: '📋' },
      { href: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // función para cerrar sesión
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
    }
  };

  return (
    <nav className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-logo">
        <h1>QUINIELA</h1>
        <p>MUNDIAL 2026 ™</p>
      </div>

      <div className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* boton de cerrar seseion */}
      <div className="sidebar-user" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">⚽</div>
          <div className="user-info">
            <div className="user-name">Mundial 2026</div>
            <div className="user-role">Sistema</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn" 
          style={{ 
            width: '100%', 
            backgroundColor: '#ef4444', 
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '8px',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
