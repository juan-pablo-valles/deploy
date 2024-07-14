// Import required modules
import express from 'express';
import pool from './config/db.js';
//import 'dotenv/config';

// Create an Express app
const app = express();

const puerto = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // dentro del directorio public los html estáticos

const secretkey = "clavesecretisima";

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

// MIDDLEWARE 
// para verificar el token JWT
// funcion que verifica Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token.split(' ')[1], secretkey, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        req.userId = decoded.id;
        next();
    });
};

// Ruta para registrar un nuevo usuario vendedor
app.post('/register', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const newUser = {
        email: req.body.email,
        password: hashedPassword,
    };

    const query = 'INSERT INTO usuarios (email, contraseña) VALUES (?, ?)';
    db.query(query, [newUser.email, newUser.password], (err, result) => {
        if (err) return res.status(500).send('Error on the server.');

        const token = jwt.sign({ id: result.insertId }, secretkey, { expiresIn: 86400 }); // expira en 24 horas
        res.status(200).send({ auth: true, token: token });
    });
});

// Ruta para autenticar un usuario y obtener un token
app.post('/login', async (req, res) => {
    const query = 'SELECT * FROM usuarios WHERE email = ?';

    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query(query, [req.body.email]);
        const user = rows[0];
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.contraseña);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        const token = jwt.sign({ id: user.id }, secretkey, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token: token });
        connection.release();
        console.log('pass valido', passwordIsValid);
    } catch (error) {
        res.send(500).send('Internal server error')
    }
});

// Ruta protegida que requiere autenticación
app.get('/protegida', verifyToken, async (req, res) => {
    const query = 'SELECT id, email FROM usuarios WHERE id = ?';
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(query, [req.userId]);
        connection.release();

        if (rows.length === 0) return res.status(404).send('No user found.');

        res.status(200).send(rows[0]);
    } catch (err) {
        res.status(500).send('Error on the server.');
    }
});


// Start the server
app.listen(puerto, () => {
    console.log('Server started on port 3000');
});