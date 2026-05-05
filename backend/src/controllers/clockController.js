const pool = require('../config/db');

// POST /api/clock/in
async function clockIn(req, res) {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM employees WHERE LOWER(name) = LOWER($1)', [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found. Contact admin.' });
    }

    const employee = result.rows[0];

    if (employee.code !== code) {
      return res.status(401).json({ error: 'Wrong code. Try again.' });
    }

    if (employee.is_clocked_in) {
      return res.status(409).json({
        error: 'Already clocked in.',
        clockInTime: employee.clock_in_time
      });
    }

    const now = new Date();
    await pool.query(
      'UPDATE employees SET is_clocked_in = TRUE, clock_in_time = $1 WHERE id = $2',
      [now, employee.id]
    );

    res.json({
      message: `Welcome ${employee.name}! Clocked in at ${now.toLocaleTimeString('da-DK')}`,
      employee: { id: employee.id, name: employee.name },
      clockInTime: now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// POST /api/clock/out
async function clockOut(req, res) {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM employees WHERE LOWER(name) = LOWER($1)', [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found. Contact admin.' });
    }

    const employee = result.rows[0];

    if (employee.code !== code) {
      return res.status(401).json({ error: 'Wrong code. Try again.' });
    }

    if (!employee.is_clocked_in) {
      return res.status(409).json({ error: 'Not clocked in.' });
    }

    const now = new Date();
    const clockIn = new Date(employee.clock_in_time);
    const durationMs = now - clockIn;

    // Save session
    await pool.query(
      `INSERT INTO sessions (employee_id, employee_name, clock_in, clock_out, duration_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [employee.id, employee.name, clockIn, now, durationMs]
    );

    // Reset employee
    await pool.query(
      'UPDATE employees SET is_clocked_in = FALSE, clock_in_time = NULL WHERE id = $1',
      [employee.id]
    );

    res.json({
      message: `Goodbye ${employee.name}! You worked ${formatDuration(durationMs)}.`,
      session: {
        employeeName: employee.name,
        clockIn,
        clockOut: now,
        durationMs
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// GET /api/clock/status/:name
async function getStatus(req, res) {
  const { name } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, is_clocked_in, clock_in_time FROM employees WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}t ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

module.exports = { clockIn, clockOut, getStatus };
