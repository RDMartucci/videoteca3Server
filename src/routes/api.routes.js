// // src/routes/api.routes.js

import express from 'express';

import * as browseController from '../controllers/browse.controller.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as indexController from '../controllers/index.controller.js';;
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { attachProfile } from '../middlewares/profile.middleware.js';


const router = express.Router();

/* ================================
   AUTH
================================ */
// Rutas para registro y login de usuarios. No requieren autenticación.
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

/* ================================
   BROWSE
================================ */
// Rutas para explorar contenido. La ruta de navegación es pública, 
// pero las rutas de historial requieren autenticación.
router.get('/browse', browseController.browse);
router.get('/media/:id', browseController.getMediaById);

/* ================================
   HISTORY (protegido)
================================ */
// Rutas para guardar y obtener el historial de navegación. 
// Requieren autenticación y perfil adjunto.
router.post('/history', protect, attachProfile, browseController.saveHistory);
router.get('/history', protect, attachProfile, browseController.getHistory);

/* ================================
   PROFILES
================================ */
// Rutas para gestionar perfiles de usuario. Requieren autenticación.
router.post('/profiles', protect, profileController.create);
router.get('/profiles', protect, profileController.list);
router.delete('/profiles/:id', protect, profileController.remove);
/* ================================
   crea PROFILE x defecto al registrar usuario
================================ */
// Ruta para obtener el perfil por defecto del usuario. Requiere autenticación.
router.get('/profiles/default', protect, profileController.getDefaultProfile);

/* ================================
   INDEX (solo admin)
================================ */
// Ruta para ejecutar el proceso de indexación. Requiere autenticación y rol de admin.
router.post('/index', protect, authorize('admin'), indexController.runIndex);


export default router;
