import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BackendProvider } from './context/BackendContext';
import OfflineBanner from './components/OfflineBanner';
import ClockIn from './pages/ClockIn';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin" replace />;
}

function App() {
  return (
    <BackendProvider>
      <AuthProvider>
        <OfflineBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ClockIn />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </BackendProvider>
  );
}

export default App;
