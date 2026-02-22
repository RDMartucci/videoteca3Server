// src/services/media.service.js
//
// Responsable de:
// - Proveer acceso a la base de datos de media con paginación, filtros y orden
// - Lógica de negocio relacionada con las películas (si es necesario)
// - Abstracción para que el resto de la app no dependa directamente de la base de datos.
// Servicio profesional de acceso a media.
//

import db from '../db/database.js';
import { getCache, setCache } from './cache.service.js';

export const getPaginatedMedia = ({
  page = 1,
  limit = 30,
  category,
  search,
  sort = "name",
  order = "ASC"
}) => {

  const cached = getCache();
  if (cached) return cached;

  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (category) {
    where.push("category = ?");
    params.push(category);
  }

  if (search) {
    where.push("cleanTitle LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalStmt = db.prepare(`
    SELECT COUNT(*) as count FROM media ${whereClause}
  `);

  const total = totalStmt.get(...params).count;

  const dataStmt = db.prepare(`
    SELECT * FROM media
    ${whereClause}
    ORDER BY ${sort} ${order}
    LIMIT ? OFFSET ?
  `);

  const data = dataStmt.all(...params, limit, offset);

  const result = {
    data,
    page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNextPage: page * limit < total
  };

  setCache(result);
  return result;
};