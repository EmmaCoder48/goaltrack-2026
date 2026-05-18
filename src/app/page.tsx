import Link from 'next/link';
import { query } from '@/lib/db';

async function getDashboardStats() {
  try {
    const [equipos] = await query<{ count: string }>('SELECT COUNT(*) FROM Equipo');
    const [partidos] = await query<{ count: string }>('SELECT COUNT(*) FROM Partido');
    const [jugados] = await query<{ count: string }>(
      'SELECT COUNT(*) FROM Partido WHERE Goles_local IS NOT NULL AND Goles_visitante IS NOT NULL'
    );
    const [usuarios] = await query<{ count: string }>('SELECT COUNT(*) FROM Usuario');
    const [quinielas] = await query<{ count: string }>('SELECT COUNT(*) FROM Quinela');

    const proximosPartidos = await query<any>(`
      SELECT p.*, 
        e1.Nombre AS local_nombre, e1.Bandera AS local_bandera,
        e2.Nombre AS visitante_nombre, e2.Bandera AS visitante_bandera,
        f.Nombre AS fase_nombre
      FROM Partido p
      JOIN Equipo e1 ON p.Id_equipo_local = e1.Id_equipo
      JOIN Equipo e2 ON p.Id_equipo_visitante = e2.Id_equipo
      JOIN Fase f ON p.Id_fase = f.Id_fase
      WHERE p.Fecha_Hora > NOW()
      ORDER BY p.Fecha_Hora ASC
      LIMIT 5
    `);

    return {
      equipos: parseInt(equipos.count),
      partidos: parseInt(partidos.count),
      jugados: parseInt(jugados.count),
      usuarios: parseInt(usuarios.count),
      quinielas: parseInt(quinielas.count),
      proximosPartidos,
    };
  } catch {
    return {
      equipos: 0, partidos: 0, jugados: 0,
      usuarios: 0, quinielas: 0, proximosPartidos: [],
    };
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="page-header">
        <h2>DASHBOARD</h2>
        <p>Bienvenido al sistema de quinielas Copa Mundial FIFA 2026™</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Equipos</div>
          <div className="stat-value stat-accent">{stats.equipos}</div>
          <div className="stat-sub">registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Partidos</div>
          <div className="stat-value">{stats.partidos}</div>
          <div className="stat-sub">{stats.jugados} jugados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Participantes</div>
          <div className="stat-value">{stats.usuarios}</div>
          <div className="stat-sub">en quinielas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Predicciones</div>
          <div className="stat-value stat-accent">{stats.quinielas}</div>
          <div className="stat-sub">ingresadas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Próximos partidos */}
        <div className="card">
          <div className="card-header">
            <h3>Próximos Partidos</h3>
            <Link href="/reportes/calendario" className="btn btn-sm btn-secondary">Ver todos</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats.proximosPartidos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>No hay partidos próximos</p>
              </div>
            ) : (
              stats.proximosPartidos.map((p: any) => (
                <div key={p.id_partido} style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--gris-claro)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}>
                      {p.local_nombre} vs {p.visitante_nombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gris)', marginTop: 2 }}>
                      {new Date(p.fecha_hora).toLocaleString('es-GT', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <span className="badge badge-azul">{p.fase_nombre}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="card">
          <div className="card-header">
            <h3>Acceso Rápido</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/quinielas" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                🎯 Ingresar Quinielas
              </Link>
              <Link href="/reportes/posiciones" className="btn btn-gold" style={{ justifyContent: 'center' }}>
                🏆 Tabla de Posiciones
              </Link>
              <Link href="/reportes/resultados" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                📊 Resultados de Quinielas
              </Link>
              <Link href="/admin/partidos" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                ⚽ Ingresar Resultados
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
