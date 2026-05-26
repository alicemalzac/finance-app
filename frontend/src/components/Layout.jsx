import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/contas-fixas', label: 'Contas Fixas', icon: '🏠' },
  { to: '/metas', label: 'Metas por Categoria', icon: '🎯' },
  { to: '/cartoes', label: 'Cartões', icon: '💳' },
  { to: '/lancamentos', label: 'Lançamentos', icon: '📋' },
  { to: '/dinheiro', label: 'Dinheiro/Débito', icon: '💵' },
  { to: '/gastos-variaveis', label: 'Gastos Variáveis', icon: '🛒' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1e293b', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8' }}>💰 Finanças</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Olá, {user?.name}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                color: isActive ? '#38bdf8' : '#cbd5e1', textDecoration: 'none',
                background: isActive ? '#0f172a' : 'transparent', borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                fontSize: 14, fontWeight: isActive ? 600 : 400, transition: 'all 0.15s',
              })}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout}
          style={{ margin: 16, padding: '8px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Sair
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {children}
      </main>
    </div>
  );
}
