// src/services/indexer.service.js
//
// Servicio de escaneo profesional
// Solo indexa archivos físicos y los guarda en SQLite
//

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { getLibraryPaths } from '../utils/storage.js';
import { cleanFileName } from '../utils/cleaner.js';
import { invalidateCache } from './cache.service.js';

const VIDEO_EXTENSIONS = /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i;

export const buildIndex = async () => {
  const paths = await getLibraryPaths();
  if (!paths || paths.length === 0) return;

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO media (
      id, name, cleanTitle, category, type,
      path, fileSize, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((movies) => {
    for (const movie of movies) {
      insertStmt.run(
        movie.id,
        movie.name,
        movie.cleanTitle,
        movie.category,
        movie.type,
        movie.path,
        movie.fileSize,
        movie.createdAt
      );
    }
  });

  const allMovies = [];

  for (const folder of paths) {
    try {
      const files = await fs.readdir(folder);
      for (const file of files) {
        if (VIDEO_EXTENSIONS.test(file)) {
          const fullPath = path.join(folder, file);
          const stats = await fs.stat(fullPath);

          allMovies.push({
            id: uuidv4(),
            name: file,
            cleanTitle: cleanFileName(file),
            category: path.basename(folder),
            type: "movie",
            path: fullPath,
            fileSize: stats.size,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch {
      continue;
    }
  }

  transaction(allMovies);
  invalidateCache();
};

