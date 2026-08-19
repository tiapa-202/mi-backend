const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb'); //  Nuevo driver
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// URL DE CONEXIÓN A MONGODB (¡REEMPLAZA CON LA TUYA!)
const MONGODB_URI = 'mongodb+srv://diegotiapa16_db_user:Dhara196@cluster0.c4sxsjl.mongodb.net/?appName=Cluster0';

const DB_NAME = 'gestor_tareas'; // Nombre de la base de datos
const COLLECTION_NAME = 'tareas'; // Nombre de la colección

let db; // Variable para guardar la conexión a la base de datos

// Conectar a MongoDB al iniciar el servidor
async function connectDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Conectado a MongoDB Atlas');
    } catch (error) {
        console.error(' Error conectando a MongoDB:', error);
        process.exit(1); // Detener el servidor si no hay conexión
    }
}

// Ruta GET (para probar que el servidor funciona)
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Hola! Soy tu backend', fecha: new Date() });
});

// Ruta POST: RECIBIR Y GUARDAR TAREAS
app.post('/tareas', async (req, res) => {
    try {
        const tarea = req.body;
        console.log(' Tarea recibida:', tarea);

        // Guardar en MongoDB
        const collection = db.collection(COLLECTION_NAME);
        const result = await collection.insertOne(tarea);

        res.json({
            mensaje: 'Tarea guardada correctamente',
            tareaGuardada: tarea,
            id: result.insertedId,
            fecha: new Date()
        });
    } catch (error) {
        console.error('Error al guardar tarea:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Ruta GET: OBTENER TODAS LAS TAREAS
app.get('/tareas', async (req, res) => {
    try {
        const collection = db.collection(COLLECTION_NAME);
        const tareas = await collection.find({}).toArray();
        res.json(tareas);
    } catch (error) {
        console.error(' Error al obtener tareas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// Iniciar el servidor SOLO DESPUÉS de conectar a la base de datos
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(` Servidor corriendo en http://localhost:${PORT}`);
    });
});
