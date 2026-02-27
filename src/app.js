// src/app.js
//
// Configuración principal de la aplicación Express.
// Importa las rutas, middlewares y configura CORS.
// Exporta la instancia de Express para ser utilizada en el servidor.
// Requiere Express para la creación del servidor, CORS para permitir solicitudes desde el frontend,
// las rutas para manejar las solicitudes API y el middleware de error para gestionar errores globales.
//


import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';
import explorerRoutes from './routes/explorer.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';


const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);
app.use('/api/explorer', explorerRoutes);

/* Middleware de error SIEMPRE al final */
app.use(errorHandler);

// Manejo de errores básico
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Algo salió mal en el servidor' });
// });

export default app;