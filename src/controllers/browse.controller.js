// src/controllers/browse.controller.js
//
// Controlador para manejar las rutas de exploración, detalles de media e historial.
// Este controlador se encarga de recibir las solicitudes, validar los datos y 
// llamar a los servicios correspondientes.
//

import db from '../db/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

/* =========================================
   BROWSE
========================================= */

export const browse = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const offset = (page - 1) * limit;

  const media = db.prepare(`
    SELECT id, name, cleanTitle, year, type, category, fileSize, poster,
           backdrop, runtime, rating, hasMetadata, createdAt
    FROM media
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM media
  `).get();

  res.json({
    success: true,
    page,
    total: total.count,
    results: media
  });
});

/* =========================================
   MEDIA DETAILS
========================================= */

export const getMediaById = asyncHandler(async (req, res) => {

  const media = db.prepare(`
    SELECT id, name, cleanTitle, year, type, category, fileSize, poster,
           backdrop, runtime, rating, hasMetadata, createdAt
    FROM media WHERE id = ?
  `).get(req.params.id);

  if (!media) {
    const error = new Error("Media no encontrada");
    error.status = 404;
    throw error;
  }

  res.json({
    success: true,
    media
  });
});

/* =========================================
   HISTORY (por perfil)
========================================= */
export const saveHistory = asyncHandler(async (req, res) => {

  const { mediaId, progress, duration } = req.body;

  if (!mediaId) {
    const error = new Error("mediaId es requerido");
    error.status = 400;
    throw error;
  }

  if (progress == null || duration == null) {
    const error = new Error("progress y duration son requeridos");
    error.status = 400;
    throw error;
  }

  const existing = db.prepare(`
    SELECT * FROM history
    WHERE profileId = ? AND mediaId = ?
  `).get(req.profile.id, mediaId);

  if (existing) {
    db.prepare(`
      UPDATE history
      SET progress = ?, duration = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      progress,
      duration,
      new Date().toISOString(),
      existing.id
    );
  } else {
    db.prepare(`
      INSERT INTO history (id, profileId, mediaId, progress, duration, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      req.profile.id,
      mediaId,
      progress,
      duration,
      new Date().toISOString()
    );
  }

  res.json({
    success: true,
    message: "Historial actualizado"
  });
});

// export const saveHistory = asyncHandler(async (req, res) => {

//   const { profileId, mediaId, progress, duration } = req.body;

//   if (!profileId) {
//     const error = new Error("profileId es requerido");
//     error.status = 400;
//     throw error;
//   }

//   if (!mediaId) {
//     const error = new Error("mediaId es requerido");
//     error.status = 400;
//     throw error;
//   }

//   if (progress == null || duration == null) {
//     const error = new Error("progress y duration son requeridos");
//     error.status = 400;
//     throw error;
//   }

//   // verificar perfil pertenece al usuario autenticado
//   const profile = db.prepare(`
//     SELECT * FROM profiles
//     WHERE id = ? AND userId = ?
//   `).get(profileId, req.user.id);

//   if (!profile) {
//     const error = new Error("Perfil inválido");
//     error.status = 403;
//     throw error;
//   }

//   const existing = db.prepare(`
//     SELECT * FROM history
//     WHERE profileId = ? AND mediaId = ?
//   `).get(profileId, mediaId);

//   if (existing) {
//     db.prepare(`
//       UPDATE history
//       SET progress = ?, duration = ?, updatedAt = ?
//       WHERE id = ?
//     `).run(
//       progress,
//       duration,
//       new Date().toISOString(),
//       existing.id
//     );
//   } else {
//     db.prepare(`
//       INSERT INTO history (id, profileId, mediaId, progress, duration, updatedAt)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `).run(
//       uuidv4(),
//       profileId,
//       mediaId,
//       progress,
//       duration,
//       new Date().toISOString()
//     );
//   }

//   res.json({
//     success: true,
//     message: "Historial actualizado"
//   });
// });

/* =========================================
   GET HISTORY (Continue Watching)
========================================= */
export const getHistory = asyncHandler(async (req, res) => {

  const history = db.prepare(`
    SELECT h.*, m.name, m.poster
    FROM history h
    JOIN media m ON h.mediaId = m.id
    WHERE h.profileId = ?
    ORDER BY h.updatedAt DESC
  `).all(req.profile.id);

  res.json({
    success: true,
    results: history
  });
});

// export const getHistory = asyncHandler(async (req, res) => {

//   const { profileId } = req.query;

//   if (!profileId) {
//     const error = new Error("profileId es requerido");
//     error.status = 400;
//     throw error;
//   }

//   const profile = db.prepare(`
//     SELECT * FROM profiles
//     WHERE id = ? AND userId = ?
//   `).get(profileId, req.user.id);

//   if (!profile) {
//     const error = new Error("Perfil inválido");
//     error.status = 403;
//     throw error;
//   }

//   const history = db.prepare(`
//     SELECT h.*, m.name, m.poster
//     FROM history h
//     JOIN media m ON h.mediaId = m.id
//     WHERE h.profileId = ?
//     ORDER BY h.updatedAt DESC
//   `).all(profileId);

//   res.json({
//     success: true,
//     results: history
//   });
// });




// import { asyncHandler } from '../utils/asyncHandler.js';
// import { getPaginatedMedia } from '../services/media.service.js';
// import { getMetadata } from '../services/metadata.service.js';
// import { saveProgress, getContinueWatching } from '../services/history.service.js';

// /**
//  * GET /api/browse
//  * Librería paginada
//  */
// export const getExplorerContent = asyncHandler(async (req, res) => {

//   let {
//     page = 1,
//     limit = 30,
//     category,
//     search,
//     sort = "name",
//     order = "ASC"
//   } = req.query;

//   page = Number(page);
//   limit = Number(limit);

//   if (isNaN(page) || page < 1) {
//     const error = new Error("Page debe ser un número mayor a 0");
//     error.status = 400;
//     throw error;
//   }

//   if (isNaN(limit) || limit < 1 || limit > 100) {
//     const error = new Error("Limit debe estar entre 1 y 100");
//     error.status = 400;
//     throw error;
//   }

//   const allowedSortFields = ["name", "createdAt", "rating", "year"];
//   if (!allowedSortFields.includes(sort)) {
//     sort = "name";
//   }

//   order = order.toUpperCase();
//   if (!["ASC", "DESC"].includes(order)) {
//     order = "ASC";
//   }

//   const result = getPaginatedMedia({
//     page,
//     limit,
//     category,
//     search,
//     sort,
//     order
//   });

//   res.json(result);
// });


// /**
//  * GET /api/media/:id
//  * Metadata lazy
//  */
// export const getMediaDetails = asyncHandler(async (req, res) => {

//   const { id } = req.params;

//   if (!id) {
//     const error = new Error("ID requerido");
//     error.status = 400;
//     throw error;
//   }

//   const data = await getMetadata(id);

//   if (!data) {
//     const error = new Error("Media no encontrada");
//     error.status = 404;
//     throw error;
//   }

//   res.json(data);
// });


// /**
//  * POST /api/history
//  * Guardar progreso
//  */
// export const saveHistory = asyncHandler(async (req, res) => {

//   // const { mediaId, progress, duration } = req.body;
//   const { profileId, mediaId, progress, duration } = req.body;

//   if (!profileId) {
//     const error = new Error("profileId es requerido");
//     error.status = 400;
//     throw error;
//   }
//   saveProgress({ profileId, mediaId, progress, duration });

//   res.json({ success: true });
// });

// // export const saveHistory = asyncHandler(async (req, res) => {

// //   const { mediaId, progress, duration } = req.body;

// //   if (!mediaId) {
// //     const error = new Error("mediaId es requerido");
// //     error.status = 400;
// //     throw error;
// //   }

// //   if (typeof progress !== "number" || progress < 0) {
// //     const error = new Error("progress debe ser número válido");
// //     error.status = 400;
// //     throw error;
// //   }

// //   if (typeof duration !== "number" || duration <= 0) {
// //     const error = new Error("duration debe ser número válido");
// //     error.status = 400;
// //     throw error;
// //   }

// //   saveProgress({ mediaId, progress, duration });

// //   res.json({ success: true });
// // });


// /**
//  * GET /api/history
//  * Continue Watching
//  */
// export const getHistory = asyncHandler(async (req, res) => {

//   const data = getContinueWatching();

//   res.json({
//     success: true,
//     count: data.length,
//     data
//   });
// });
