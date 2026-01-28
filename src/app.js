// src/app.js

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';
import explorerRoutes from './routes/explorer.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);
app.use('/api/explorer', explorerRoutes);

// Manejo de errores básico
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

export default app;