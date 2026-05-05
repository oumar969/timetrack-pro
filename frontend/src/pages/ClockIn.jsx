import { useState, useEffect } from 'react';
import { clockIn, clockOut, getClockStatus } from '../api';
import './ClockIn.css';

export default function ClockIn() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { isClockedIn: bool, clockInTime: date }
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'warning', text }
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async (empName) => {
    if (!empName.trim()) return;
    try {
      const res = await getClockStatus(empName);
      setStatus({ isClockedIn: res.data.is_clocked_in, clockInTime: res.data.clock_in_time });
    } catch {
      setStatus(null);
    }
  };

  const handleNameBlur = () => checkStatus(name);

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      setMessage({ type: 'error', text: 'Udfyld både navn og kode.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (!status?.isClockedIn) {
        const res = await clockIn(name, code);
        setMessage({ type: 'success', text: res.data.message });
        setStatus({ isClockedIn: true, clockInTime: res.data.clockInTime });
      } else {
        const res = await clockOut(name, code);
        setMessage({ type: 'warning', text: res.data.message });
        setStatus({ isClockedIn: false });
      }
      setCode('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Noget gik galt.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clockin-bg">
      <div className="clockin-card">
        <div className="clock-display">{time.toLocaleTimeString('da-DK')}</div>

        <div className="card-header">
          <h2>Tidsregistrering</h2>
          <p>Skriv dit navn og kode for at stemme ind eller ud</p>
        </div>

        {status?.isClockedIn && (
          <div className="badge-clocked-in">
            ● Du er i øjeblikket stemplet ind siden{' '}
            {new Date(status.clockInTime).toLocaleTimeString('da-DK')}
          </div>
        )}

        {message && (
          <div className={`msg msg-${message.type}`}>{message.text}</div>
        )}

        <div className="field">
          <label>Navn</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Dit fulde navn"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label>Kode</label>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Din personlige kode"
          />
        </div>

        <button
          className={`btn-clock ${status?.isClockedIn ? 'btn-out' : 'btn-in'}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '...' : status?.isClockedIn ? 'Stem ud ←' : 'Stem ind →'}
        </button>

        <a className="admin-link" href="/admin">Admin-panel →</a>
      </div>
    </div>
  );
}
