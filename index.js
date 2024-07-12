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
app.use(express.static('public')); // dentro del directorio public los html estáticos

// GET de todos los autos para html
app.get('/productos', async (req, res) => {
    const sql = `SELECT 
                marcas.nombre AS marca,
                modelos.nombre AS modelo, 
                autos.año, 
                autos.kilometraje,
                autos.precio,
                autos.descripcion,
                autos.imagen_url
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

// GET de un auto por id
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
        console.log("Auto  ->", rows)
        res.json(rows[0]);
    } catch (error) {
        res.send(500).send('Internal server error')
    }
});

// GET de tabla autos todos
app.get('/autos', async (req, res) => {
    const sql = `SELECT * FROM autos
                ORDER by id DESC`;
    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(sql);
        connection.release();
        res.json(rows);

    } catch (error) {
        res.send(500).send('Internal server error')
    }

});

// Inserta un auto en tabla
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

// Actualiza un auto por id en tabla
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

// Elimina un auto de tabla por id
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