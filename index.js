const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  //  NUEVA LÍNEA: Importamos cors
const app = express();
const PORT = 3000;

//  NUEVA LÍNEA: Usamos cors para permitir peticiones de cualquier origen
app.use(cors());

// Usar body-parser para entender datos JSON
app.use(bodyParser.json());

// Ruta GET (para probar que el servidor funciona)
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Hola! Soy tu backend', fecha: new Date() });
});

// Ruta POST: RECIBIR TAREAS DEL FRONTEND
app.post('/tareas', (req, res) => {
    const tarea = req.body;
    console.log(' Tarea recibida:', tarea);

    res.json({
        mensaje: 'Tarea recibida correctamente',
        tareaRecibida: tarea,
        fecha: new Date()
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});