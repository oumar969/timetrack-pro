const pool = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        is_clocked_in BOOLEAN DEFAULT FALSE,
        clock_in_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        employee_name VARCHAR(255) NOT NULL,
        clock_in TIMESTAMP NOT NULL,
        clock_out TIMESTAMP,
        duration_ms BIGINT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default admin
    const existing = await client.query("SELECT id FROM admins WHERE username = 'admin'");
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10);
      await client.query(
        "INSERT INTO admins (username, password_hash) VALUES ('admin', $1)",
        [hash]
      );
      console.log("Default admin created → username: admin / password: admin123");
    }

    // Seed demo employees
    const empCount = await client.query("SELECT COUNT(*) FROM employees");
    if (parseInt(empCount.rows[0].count) === 0) {
      const demoEmployees = [
        { name: 'Jonas Hansen', code: '1234' },
        { name: 'Sara Nielsen', code: '5678' },
        { name: 'Mikkel Larsen', code: '9012' },
      ];
      for (const emp of demoEmployees) {
        await client.query(
          "INSERT INTO employees (name, code) VALUES ($1, $2)",
          [emp.name, emp.code]
        );
      }
      console.log("Demo employees seeded");
    }

    console.log('Migrations complete!');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

migrate().then(() => process.exit(0)).catch(() => process.exit(1));
