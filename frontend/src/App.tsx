import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserList from './components/UserList';
import RegisterCompany from './components/RegisterCompany'; 
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={auth ? <UserDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={auth && (auth.role === 'admin' || auth.role === 'master') ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/users"
        element={auth && (auth.role === 'admin' || auth.role === 'master') ? <UserList /> : <Navigate to="/login" />}
      />
      <Route
        path="/register_company"
        element={auth && auth.role === 'master' ? <RegisterCompany /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={
          auth ? (
            auth.role === 'admin' || auth.role === 'master' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;