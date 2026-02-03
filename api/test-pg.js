const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'events_db',
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected with pg client!');
    const res = await client.query('SELECT current_database()');
    console.log('Database:', res.rows[0]);
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
