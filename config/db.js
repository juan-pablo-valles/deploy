import { createPool } from 'mysql2/promise';

// Create a connection pool
const pool = createPool({
  
    host: 'bo873z9psvcbwj1w0l5p-mysql.services.clever-cloud.com',
    user: 'uxnh0xdp6boktd62',
    password: 'kYh1zZCmRRUtnr87Pbe3',
    database: 'bo873z9psvcbwj1w0l5p',
    connectionLimit: 5 
});

// test connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to the database');
        connection.release();
    })
    .catch(error => {
        console.log('Error connecting to the database', error);
    });


export default pool;