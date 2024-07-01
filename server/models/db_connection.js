/* connect to mysql database */
const mysql = require('mysql');

const db_connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'gardensystem',
});

db_connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = db_connection;