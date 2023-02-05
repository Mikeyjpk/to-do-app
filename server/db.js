const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
    user: 'postgres',
    password: '2M0iZ6#ynl5q',
    host: 'localhost',
    port: 5432,
    database: 'todoapp'
})

module.exports = pool


