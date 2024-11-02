const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.getConnection()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exit(1);
  });

module.exports = db;










// const mysql = require('mysql2');
// require('dotenv').config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });


// module.exports = db.promise(); 