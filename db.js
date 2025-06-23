const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',          // Because you're using MySQL on your laptop
  user: 'root',               // Default username
  password: '',               // Your MySQL password
  database: 'aspirelearn'     // The database you created
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database.');
  }
});

module.exports = db;
