const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Configurar CORS para aceptar peticiones desde cualquier origen
app.use(cors({
    origin: '*', // Permitir peticiones desde cualquier dominio (solo para desarrollo)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ mensaje: '¡Hola! Soy tu backend', fecha: new Date() });
});

app.post('/tareas', (req, res) => {
    const tarea = req.body;
    console.log('📥 Tarea recibida:', tarea);
    res.json({
        mensaje: 'Tarea recibida correctamente',
        tareaRecibida: tarea,
        fecha: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`✅Servidor corriendo en http://localhost:${PORT}`);
});