'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>QUINIELA</h1>
        <p>MUNDIAL 2026 ™</p>
      </div>

      <div className="sidebar-nav">
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

      <div className="sidebar-user">
        <div className="user-avatar">⚽</div>
        <div className="user-info">
          <div className="user-name">Mundial 2026</div>
          <div className="user-role">Sistema</div>
        </div>
      </div>
    </nav>
  );
}
