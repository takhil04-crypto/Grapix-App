import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;