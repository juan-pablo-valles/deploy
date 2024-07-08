import express from 'express';
import pool from './config/db.js';
//import 'dotenv/config';

// Import required modules

// Create an Express app
const app = express();

const puerto = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Read all resources
app.get('/productos', async (req, res) => {
    const sql = `SELECT 
                marcas.nombre AS marca,
                modelos.nombre AS modelo, 
                autos.año, 
                autos.kilometraje,
                autos.precio,
                autos.descripcion
                FROM autos 
                JOIN marcas ON marcas.id = autos.id_marca
                JOIN modelos ON modelos.id = autos.id_modelo
                ORDER by marcas.nombre DESC`;
    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql);
        connection.release();
        res.json(rows);

    } catch (error) {
        res.send(500).send('Internal server error')
    }

});

// Read a specific resource
app.get('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const sql = `SELECT 
    marcas.nombre AS marca,
    modelos.nombre AS modelo, 
    autos.año, 
    autos.kilometraje,
    autos.precio,
    autos.descripcion
    FROM autos 
    JOIN marcas ON marcas.id = autos.id_marca
    JOIN modelos ON modelos.id = autos.id_modelo
    WHERE autos.id = ?`;

    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql, [id]);
        connection.release();
        console.log("UN AUTO --> ", rows)
        res.json(rows[0]);
    } catch (error) {
        res.send(500).send('Internal server error')
    }
});

// Create a new resource
app.post('/productos', async (req, res) => {

    const auto = req.body;

    const sql = `INSERT INTO autos SET ?`;

    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql, [auto]);
        connection.release();
        res.send(`
            <h1>El auto se ha creado con id: ${rows.insertId}</h1>
        `);
    } catch (error) {
        res.send(500).send('Internal server error')
    }
});

// Update a specific resource
app.put('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const auto = req.body;

    const sql = `UPDATE autos SET ? WHERE id = ?`;

    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql, [auto, id]);
        connection.release();
        console.log(rows)
         res.send(`
            <h1>Auto actualizado id: ${id}</h1>
        `);
    } catch (error) {
        res.send(500).send('Internal server error')
    }

});

// Delete a specific resource
app.delete('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM autos WHERE id = ?`;

     try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql, [id]);
        connection.release();
        console.log(rows)
         res.send(`
            <h1>Auto borrado id: ${id}</h1>
        `);
    } catch (error) {
        res.send(500).send('Internal server error')
    }
});

// Start the server
app.listen(puerto, () => {
    console.log('Server started on port 3000');
});