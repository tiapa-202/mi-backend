const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// La URI ahora viene de una variable de entorno, no del código
const MONGODB_URI = process.env.MONGODB_URI;

const DB_NAME = 'gestor_tareas';
const COLLECTION_NAME = 'tareas';

let db;

async function connectDB() {
    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        await client.connect();
        db = client.db(DB_NAME);
        console.log(' Conectado a MongoDB Atlas');
    } catch (error) {
        console.error(' Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.json({ mensaje: '¡Hola! Soy tu backend', fecha: new Date() });
});

app.post('/tareas', async (req, res) => {
    try {
        const tarea = req.body;
        console.log('Tarea recibida:', tarea);

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

app.get('/tareas', async (req, res) => {
    try {
        const collection = db.collection(COLLECTION_NAME);
        const tareas = await collection.find({}).toArray();
        res.json(tareas);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});