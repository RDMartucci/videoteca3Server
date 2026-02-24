// src/routes/api.routes.js

import express from 'express';
const router = express.Router();

// Controllers
import * as browseController from '../controllers/browse.controller.js';
import * as configController from '../controllers/config.controller.js';
import { getHealth } from '../controllers/health.controller.js';
import { streamMedia } from '../controllers/stream.controller.js';
import { runIndex } from '../controllers/index.controller.js';

/* ================================
   CONFIGURACIÓN
================================ */

router.get('/settings', configController.getSettings);
router.post('/settings', configController.saveSettings);

/* ================================
   HEALTH CHECK
================================ */

router.get('/health', getHealth);

/* ================================
   LIBRERÍA
================================ */

router.get('/browse', browseController.getExplorerContent);
router.get('/media/:id', browseController.getMediaDetails);

/* ================================
   STREAMING
================================ */

router.get('/stream/:id', streamMedia);

/* ================================
   HISTORIAL
================================ */

router.post('/history', browseController.saveHistory);
router.get('/history', browseController.getHistory);

/* ================================
   INDEXACIÓN
================================ */

router.post('/index', runIndex);

export default router;
