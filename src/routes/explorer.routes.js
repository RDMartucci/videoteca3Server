// backend/routes/explorer.routes.js
import express from 'express';
import { browseFolder } from '../controllers/explorer.controller.js';

const router = express.Router();

// Definimos la ruta POST que el frontend acaba de llamar
router.post('/browse', browseFolder);

export default router;