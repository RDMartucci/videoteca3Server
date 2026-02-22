// src/services/history.service.js

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
