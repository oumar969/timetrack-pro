import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees, createEmployee, deleteEmployee, getSessions, getWeekAnalytics } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './Dashboard.css';

export default function AdminDashboard() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [empRes, sessRes, anaRes] = await Promise.all([
        getEmployees(), getSessions({ limit: 300 }), getWeekAnalytics()
      ]);
      setEmployees(empRes.data);
      setSessions(sessRes.data);
      setAnalytics(anaRes.data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/admin'); };

  const handleAddEmployee = async () => {
    if (!newName || !newCode) { setAddMsg('Udfyld navn og kode'); return; }
    try {
      await createEmployee(newName, newCode);
      setNewName(''); setNewCode(''); setAddMsg('');
      fetchAll();
    } catch (err) { setAddMsg(err.response?.data?.error || 'Fejl.'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Slet ${name}? Historik bevares.`)) return;
    await deleteEmployee(id);
    fetchAll();
  };

  const filteredSessions = sessions.filter(s => {
    if (filterEmp && s.employee_id !== parseInt(filterEmp)) return false;
    if (filterDate && !s.clock_in.startsWith(filterDate)) return false;
    return true;
  });

  const activeNow = employees.filter(e => e.is_clocked_in);

  const formatMs = (ms) => {
    if (!ms) return '0t 0m';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}t ${m}m`;
  };

  const chartData = analytics?.daily?.map(d => ({
    date: new Date(d.date).toLocaleDateString('da-DK', { weekday: 'short' }),
    timer: parseFloat((d.total_ms / 3600000).toFixed(2))
  })) || [];

  return (
    <div className="dash-bg">
      <nav className="dash-nav">
        <div className="dash-logo">⏱ TimeTrack</div>
        <div className="dash-tabs">
          {['overview','employees','history','analytics'].map(t => (
            <button key={t} className={`dash-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='overview'?'Overblik':t==='employees'?'Medarbejdere':t==='history'?'Historik':'Analyse'}
            </button>
          ))}
        </div>
        <div className="dash-nav-right">
          <span className="dash-user">{username}</span>
          <button className="btn-nav-logout" onClick={handleLogout}>Log ud</button>
        </div>
      </nav>

      <div className="dash-content">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className="stats-row">
              <div className="stat-card"><div className="stat-label">Aktive nu</div><div className="stat-val green">{activeNow.length}</div></div>
              <div className="stat-card"><div className="stat-label">Timer i dag</div><div className="stat-val purple">{analytics ? (analytics.todayMs/3600000).toFixed(1) : '...'}</div></div>
              <div className="stat-card"><div className="stat-label">Medarbejdere</div><div className="stat-val">{employees.length}</div></div>
              <div className="stat-card"><div className="stat-label">Vagtskift total</div><div className="stat-val orange">{sessions.length}</div></div>
            </div>

            <div className="section-title">Aktive nu <span className="badge">{activeNow.length}</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Status</th><th>Navn</th><th>Stemplet ind</th></tr></thead>
                <tbody>
                  {activeNow.length === 0
                    ? <tr><td colSpan={3} className="empty">Ingen aktive</td></tr>
                    : activeNow.map(e => (
                      <tr key={e.id}>
                        <td><span className="dot dot-on"></span>Aktiv</td>
                        <td><strong>{e.name}</strong></td>
                        <td>{new Date(e.clock_in_time).toLocaleTimeString('da-DK')}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            <div className="section-title">Alle medarbejdere</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Status</th><th>Navn</th><th>Kode</th></tr></thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.id}>
                      <td>{e.is_clocked_in ? <><span className="dot dot-on"></span>Aktiv</> : <><span className="dot dot-off"></span>Offline</>}</td>
                      <td><strong>{e.name}</strong></td>
                      <td className="mono">{e.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMPLOYEES */}
        {tab === 'employees' && (
          <div>
            <div className="add-form">
              <h3>Tilføj medarbejder</h3>
              {addMsg && <div className="msg msg-error">{addMsg}</div>}
              <div className="add-row">
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Fuldt navn" />
                <input value={newCode} onChange={e=>setNewCode(e.target.value)} placeholder="Kode (f.eks. 1234)" />
                <button className="btn-add" onClick={handleAddEmployee}>Tilføj</button>
              </div>
            </div>

            <div className="emp-grid">
              {employees.map(e => (
                <div key={e.id} className="emp-card">
                  <div className="emp-card-top">
                    <div>
                      <div className="emp-name">{e.name}</div>
                      <div className="emp-code mono">Kode: {e.code}</div>
                    </div>
                    <button className="btn-delete" onClick={() => handleDelete(e.id, e.name)}>Slet</button>
                  </div>
                  {e.is_clocked_in && (
                    <div className="emp-active">● Aktiv siden {new Date(e.clock_in_time).toLocaleTimeString('da-DK')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div>
            <div className="filter-row">
              <select value={filterEmp} onChange={e=>setFilterEmp(e.target.value)}>
                <option value="">Alle medarbejdere</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
              <button className="btn-reset" onClick={()=>{setFilterEmp('');setFilterDate('');}}>Nulstil</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Navn</th><th>Dato</th><th>Ind</th><th>Ud</th><th>Varighed</th></tr></thead>
                <tbody>
                  {filteredSessions.length === 0
                    ? <tr><td colSpan={5} className="empty">Ingen registreringer</td></tr>
                    : filteredSessions.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.employee_name}</strong></td>
                        <td className="mono">{new Date(s.clock_in).toLocaleDateString('da-DK')}</td>
                        <td className="mono green">{new Date(s.clock_in).toLocaleTimeString('da-DK')}</td>
                        <td className="mono red">{new Date(s.clock_out).toLocaleTimeString('da-DK')}</td>
                        <td className="mono"><strong>{formatMs(s.duration_ms)}</strong></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div>
            <div className="chart-card">
              <div className="chart-title">Timer pr. dag — seneste 7 dage</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" stroke="#6b6b80" tick={{ fontFamily: 'DM Mono', fontSize: 12 }} />
                  <YAxis stroke="#6b6b80" tick={{ fontFamily: 'DM Mono', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, fontFamily: 'DM Mono' }} />
                  <Bar dataKey="timer" fill="#00ff88" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="section-title">Medarbejder-rangering denne uge</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Navn</th><th>Timer denne uge</th><th>Gns. pr. dag</th><th>Dage aktiv</th></tr></thead>
                <tbody>
                  {analytics?.employees?.length === 0
                    ? <tr><td colSpan={5} className="empty">Ingen data</td></tr>
                    : analytics?.employees?.map((e, i) => (
                      <tr key={e.employee_id}>
                        <td className="rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                        <td><strong>{e.employee_name}</strong></td>
                        <td className="green mono">{(e.total_ms/3600000).toFixed(2)} t</td>
                        <td className="mono">{(e.total_ms/3600000/e.days_active).toFixed(2)} t</td>
                        <td className="mono">{e.days_active} dage</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
