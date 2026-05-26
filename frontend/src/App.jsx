import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContasFixas from './pages/ContasFixas';
import Metas from './pages/Metas';
import Cartoes from './pages/Cartoes';
import Lancamentos from './pages/Lancamentos';
import Dinheiro from './pages/Dinheiro';
import GastosVariaveis from './pages/GastosVariaveis';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/contas-fixas" element={<PrivateRoute><ContasFixas /></PrivateRoute>} />
          <Route path="/metas" element={<PrivateRoute><Metas /></PrivateRoute>} />
          <Route path="/cartoes" element={<PrivateRoute><Cartoes /></PrivateRoute>} />
          <Route path="/lancamentos" element={<PrivateRoute><Lancamentos /></PrivateRoute>} />
          <Route path="/dinheiro" element={<PrivateRoute><Dinheiro /></PrivateRoute>} />
          <Route path="/gastos-variaveis" element={<PrivateRoute><GastosVariaveis /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
