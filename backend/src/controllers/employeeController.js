const pool = require('../config/db');

// GET /api/employees
async function getAll(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, code, is_clocked_in, clock_in_time, created_at FROM employees ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// POST /api/employees
async function create(req, res) {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required.' });

  try {
    const existing = await pool.query(
      'SELECT id FROM employees WHERE LOWER(name) = LOWER($1)', [name]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Employee with this name already exists.' });
    }

    const result = await pool.query(
      'INSERT INTO employees (name, code) VALUES ($1, $2) RETURNING id, name, code, created_at',
      [name, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// PUT /api/employees/:id
async function update(req, res) {
  const { id } = req.params;
  const { name, code } = req.body;

  try {
    const result = await pool.query(
      'UPDATE employees SET name = COALESCE($1, name), code = COALESCE($2, code) WHERE id = $3 RETURNING *',
      [name, code, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

// DELETE /api/employees/:id
async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { getAll, create, update, remove };
