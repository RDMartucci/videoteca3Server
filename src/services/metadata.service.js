// src/services/metadata.service.js

import db from "../db/database.js";
import axios from "axios";

const TMDB_BASE = "https://api.themoviedb.org/3";

export const getMetadata = async (mediaId) => {
  const media = db.prepare("SELECT * FROM media WHERE id = ?").get(mediaId);
  if (!media) return null;

  if (media.hasMetadata) return media;

  const token = process.env.TMDB_TOKEN;
  if (!token) return media;

  try {
    const search = await axios.get(`${TMDB_BASE}/search/multi`, {
      params: { query: media.cleanTitle, language: "es-ES" },
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!search.data.results.length) return media;

    const top = search.data.results[0];

    const details = await axios.get(
      `${TMDB_BASE}/${top.media_type || "movie"}/${top.id}`,
      {
        params: { language: "es-ES", append_to_response: "credits" },
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const d = details.data;

    db.prepare(`
      UPDATE media SET
        poster = ?,
        backdrop = ?,
        runtime = ?,
        rating = ?,
        hasMetadata = 1
      WHERE id = ?
    `).run(
      d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
      d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
      d.runtime,
      d.vote_average,
      mediaId
    );

    return db.prepare("SELECT * FROM media WHERE id = ?").get(mediaId);

  } catch {
    return media;
  }
};
