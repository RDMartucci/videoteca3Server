// // src/routes/api.routes.js

import express from 'express';

import * as browseController from '../controllers/browse.controller.js';
import * as authController from '../controllers/auth.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import * as indexController from '../controllers/index.controller.js';;

import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* ================================
   AUTH
================================ */

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

/* ================================
   BROWSE
================================ */

router.get('/browse', browseController.browse);
router.get('/media/:id', browseController.getMediaById);

/* ================================
   HISTORY (protegido)
================================ */

router.post('/history', protect, browseController.saveHistory);
router.get('/history', protect, browseController.getHistory);

/* ================================
   PROFILES
================================ */

router.post('/profiles', protect, profileController.create);
router.get('/profiles', protect, profileController.list);
router.delete('/profiles/:id', protect, profileController.remove);

/* ================================
   INDEX (solo admin)
================================ */

router.post('/index', protect, authorize('admin'), indexController.runIndex);

export default router;
