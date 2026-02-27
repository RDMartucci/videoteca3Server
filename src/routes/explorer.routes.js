// src/routes/explorer.routes.js
// Este archivo define las rutas relacionadas con la exploración de carpetas en el backend.
// Importamos express para crear un router y la función exploreFolder del controlador correspondiente.
// La función exploreFolder se encargará de manejar las solicitudes POST a la ruta '/browse' y 
// devolverá la estructura de carpetas solicitada por el frontend.
//

import express from 'express';
import { exploreFolder } from '../controllers/explorer.controller.js';

const router = express.Router();

// Definimos la ruta POST que el frontend acaba de llamar
// router.post('/browse', exploreFolder);
router.post('/browse', exploreFolder);

export default router;