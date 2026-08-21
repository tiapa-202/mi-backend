const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ============================================
// CONEXIÓN A POSTGRESQL (usando variables de entorno)
// ============================================
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

// Verificar conexión
pool.connect((err) => {
    if (err) {
        console.error(' Error conectando a PostgreSQL:', err);
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
        console.error(' Error al obtener tareas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Crear una nueva tarea
app.post('/tareas', async (req, res) => {
    try {
        const { titulo, categoria } = req.body;
        console.log('📥 Tarea recibida:', titulo, categoria);

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
        console.error(' Error al eliminar tarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(` Servidor corriendo en el puerto ${PORT}`);
});