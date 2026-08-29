const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CONFIGURACIÓN CORS: LA CLAVE ESTÁ AQUÍ
// ============================================
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://centro-de-pruebas.onrender.com',
            'http://localhost:5500',
            'http://localhost:3000'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(' Origen bloqueado por CORS:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// APLICAR CORS A TODAS LAS RUTAS (¡ANTES QUE NADA!)
app.use(cors(corsOptions));

// Middleware para parsear JSON (DESPUÉS de CORS)
app.use(express.json());

// El resto de tu código (conexión a BD y rutas) va aquí...
// ... (Tu código de conexión a PostgreSQL y las rutas GET, POST, DELETE)
// ============================================
// CONEXIÓN A POSTGRESQL
// ============================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 👇 AGREGA ESTO — evita que un error de conexión tumbe todo el servidor
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    // NO uses process.exit() aquí — solo lo registramos y seguimos vivos
});

// También corrige el pool.connect() de prueba para que no mate el proceso:
pool.connect((err, client) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err);
        return; // antes tenías process.exit(1) aquí — quítalo
    }
    console.log('Conectado a PostgreSQL');
    client.release(); // libera la conexión de prueba
});
// Verificar conexión
pool.connect((err) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err);
        process.exit(1);
    }
    console.log(' Conectado a PostgreSQL');
});

// ============================================
// RUTAS
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Hola! Soy tu backend con PostgreSQL', fecha: new Date() });
});

// Obtener todas las tareas
app.get('/tareas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tareas ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Crear una nueva tarea
app.post('/tareas', async (req, res) => {
    try {
        const { titulo, categoria } = req.body;
        console.log(' Tarea recibida:', titulo, categoria);

        const query = 'INSERT INTO tareas (titulo, categoria) VALUES ($1, $2) RETURNING *';
        const values = [titulo, categoria];
        const result = await pool.query(query, values);

        res.json({
            mensaje: 'Tarea guardada correctamente',
            tareaGuardada: result.rows[0],
            fecha: new Date()
        });
    } catch (error) {
        console.error(' Error al guardar tarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Eliminar una tarea (opcional)
app.delete('/tareas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query('DELETE FROM tareas WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        }
        res.json({ mensaje: 'Tarea eliminada', tareaEliminada: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});