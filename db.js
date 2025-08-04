// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       // or your MySQL host
  user: 'root',            // replace with your MySQL user
  password: 'n3u3da!',            // replace with your MySQL password
  database: 'financial_portfolio'
});

// Connect once to verify
connection.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// Export for use in other files
module.exports = connection;
