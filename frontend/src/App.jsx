import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Sales from './pages/Sales';
import Pending from './pages/Pending';
import Movements from './pages/Movements';
import StockEntry from './pages/StockEntry';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-dark-400 text-sm">Carregando...</span>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />}   />
          <Route path="products"    element={<Products />}    />
          <Route path="categories"  element={<Categories />}  />
          <Route path="sales"       element={<Sales />}       />
          <Route path="pending"     element={<Pending />}     />
          <Route path="movements"   element={<Movements />}   />
          <Route path="stock-entry" element={<StockEntry />}  />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
