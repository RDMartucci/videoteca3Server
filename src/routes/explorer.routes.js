// src/routes/explorer.routes.js
//
// Rutas para la exploración de carpetas.
//

import express from 'express';
import { exploreFolder } from '../controllers/explorer.controller.js';

const router = express.Router();

// Definimos la ruta POST que el frontend acaba de llamar
// router.post('/browse', exploreFolder);
router.post('/browse', exploreFolder);

export default router;