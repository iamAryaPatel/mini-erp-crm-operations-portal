const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function check() {
  const p = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/mini_erp_crm' });
  try {
    const res = await p.query('SELECT email, role, password_hash FROM users LIMIT 5');
    console.log('Users found:', res.rows.length);
    for (const row of res.rows) {
      const match = await bcrypt.compare('Admin@123', row.password_hash);
      console.log('  ' + row.email + ' (' + row.role + ') — password matches: ' + match);
    }
  } catch (e) {
    console.error('Full Error:', e);
  } finally {
    await p.end();
  }
}
check();
