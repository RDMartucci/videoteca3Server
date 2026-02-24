// src/controllers/browse.controller.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { getPaginatedMedia } from '../services/media.service.js';
import { getMetadata } from '../services/metadata.service.js';
import { saveProgress, getContinueWatching } from '../services/history.service.js';

/**
 * GET /api/browse
 * Librería paginada
 */
export const getExplorerContent = asyncHandler(async (req, res) => {

  let {
    page = 1,
    limit = 30,
    category,
    search,
    sort = "name",
    order = "ASC"
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page < 1) {
    const error = new Error("Page debe ser un número mayor a 0");
    error.status = 400;
    throw error;
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    const error = new Error("Limit debe estar entre 1 y 100");
    error.status = 400;
    throw error;
  }

  const allowedSortFields = ["name", "createdAt", "rating", "year"];
  if (!allowedSortFields.includes(sort)) {
    sort = "name";
  }

  order = order.toUpperCase();
  if (!["ASC", "DESC"].includes(order)) {
    order = "ASC";
  }

  const result = getPaginatedMedia({
    page,
    limit,
    category,
    search,
    sort,
    order
  });

  res.json(result);
});


/**
 * GET /api/media/:id
 * Metadata lazy
 */
export const getMediaDetails = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!id) {
    const error = new Error("ID requerido");
    error.status = 400;
    throw error;
  }

  const data = await getMetadata(id);

  if (!data) {
    const error = new Error("Media no encontrada");
    error.status = 404;
    throw error;
  }

  res.json(data);
});


/**
 * POST /api/history
 * Guardar progreso
 */
export const saveHistory = asyncHandler(async (req, res) => {

  const { mediaId, progress, duration } = req.body;

  if (!mediaId) {
    const error = new Error("mediaId es requerido");
    error.status = 400;
    throw error;
  }

  if (typeof progress !== "number" || progress < 0) {
    const error = new Error("progress debe ser número válido");
    error.status = 400;
    throw error;
  }

  if (typeof duration !== "number" || duration <= 0) {
    const error = new Error("duration debe ser número válido");
    error.status = 400;
    throw error;
  }

  saveProgress({ mediaId, progress, duration });

  res.json({ success: true });
});


/**
 * GET /api/history
 * Continue Watching
 */
export const getHistory = asyncHandler(async (req, res) => {

  const data = getContinueWatching();

  res.json({
    success: true,
    count: data.length,
    data
  });
});
