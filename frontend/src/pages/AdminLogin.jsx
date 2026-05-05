import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ClockIn.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError('Udfyld begge felter.'); return; }
    setLoading(true); setError('');
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Forkert brugernavn eller kode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clockin-bg">
      <div className="clockin-card">
        <div className="card-header">
          <h2>⚙️ Admin-adgang</h2>
          <p>Log ind for at se dashboard</p>
        </div>
        {error && <div className="msg msg-error">{error}</div>}
        <div className="field">
          <label>Brugernavn</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoComplete="off" />
        </div>
        <div className="field">
          <label>Kodeord</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" />
        </div>
        <button className="btn-clock btn-in" onClick={handleLogin} disabled={loading}>
          {loading ? '...' : 'Log ind →'}
        </button>
        <a className="admin-link" href="/">← Tilbage til tidsregistrering</a>
      </div>
    </div>
  );
}
