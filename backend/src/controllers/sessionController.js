const pool = require('../config/db');

// GET /api/sessions?employeeId=&date=&limit=
async function getAll(req, res) {
  const { employeeId, date, limit = 200 } = req.query;

  let query = 'SELECT * FROM sessions WHERE 1=1';
  const params = [];

  if (employeeId) {
    params.push(employeeId);
    query += ` AND employee_id = $${params.length}`;
  }

  if (date) {
    params.push(date);
    query += ` AND DATE(clock_in) = $${params.length}`;
  }

  query += ` ORDER BY clock_in DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// GET /api/sessions/today
async function getToday(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.*, e.is_clocked_in, e.clock_in_time
       FROM sessions s
       LEFT JOIN employees e ON e.id = s.employee_id
       WHERE DATE(s.clock_in) = CURRENT_DATE
       ORDER BY s.clock_in DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// GET /api/analytics/week
async function getWeekAnalytics(req, res) {
  try {
    // Hours per day last 7 days
    const dailyResult = await pool.query(`
      SELECT
        DATE(clock_in) AS date,
        SUM(duration_ms) AS total_ms,
        COUNT(*) AS session_count
      FROM sessions
      WHERE clock_in >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(clock_in)
      ORDER BY date ASC
    `);

    // Per employee this week
    const employeeResult = await pool.query(`
      SELECT
        employee_name,
        employee_id,
        SUM(duration_ms) AS total_ms,
        COUNT(*) AS sessions,
        COUNT(DISTINCT DATE(clock_in)) AS days_active
      FROM sessions
      WHERE clock_in >= DATE_TRUNC('week', NOW())
      GROUP BY employee_name, employee_id
      ORDER BY total_ms DESC
    `);

    // Today's total
    const todayResult = await pool.query(`
      SELECT COALESCE(SUM(duration_ms), 0) AS total_ms
      FROM sessions
      WHERE DATE(clock_in) = CURRENT_DATE
    `);

    // Currently active (clocked in now)
    const activeResult = await pool.query(
      'SELECT id, name, clock_in_time FROM employees WHERE is_clocked_in = TRUE'
    );

    res.json({
      daily: dailyResult.rows,
      employees: employeeResult.rows,
      todayMs: todayResult.rows[0].total_ms,
      activeNow: activeResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { getAll, getToday, getWeekAnalytics };
