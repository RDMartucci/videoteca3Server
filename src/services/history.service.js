// src/services/history.service.js
// Servicio para gestionar el historial de visualización de los usuarios.
// Este servicio utiliza una base de datos SQLite para almacenar el progreso de visualización
// de cada medio. La función saveProgress se encarga de guardar o actualizar el progreso 
// de un medio específico, mientras que getContinueWatching devuelve una lista de medios
// que el usuario ha comenzado a ver pero no ha terminado, ordenados por la fecha de actualización.
//


import db from "../db/database.js";
import { v4 as uuidv4 } from "uuid";

export const saveProgress = ({ mediaId, progress, duration }) => {
  const existing = db.prepare("SELECT * FROM history WHERE mediaId = ?").get(mediaId);

  if (existing) {
    db.prepare(`
      UPDATE history
      SET progress = ?, duration = ?, updatedAt = ?
      WHERE mediaId = ?
    `).run(progress, duration, new Date().toISOString(), mediaId);
  } else {
    db.prepare(`
      INSERT INTO history (id, mediaId, progress, duration, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), mediaId, progress, duration, new Date().toISOString());
  }
};

export const getContinueWatching = () => {
  return db.prepare(`
    SELECT media.*, history.progress
    FROM history
    JOIN media ON history.mediaId = media.id
    ORDER BY history.updatedAt DESC
  `).all();
};
