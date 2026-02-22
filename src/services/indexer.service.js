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


/*************************************************************************************** */
// // src/services/indexer.service.js (version mejorada con búsqueda automática de pósters)
// //
// // Servicio de indexación de películas con búsqueda automática de pósters en TMDB
// // Si no se encuentra un mapeo manual, se intenta buscar el póster usando la API de TMDB
// // con un token de autenticación para mayor consistencia.
// //

// import fs from 'fs/promises';
// import path from 'path';
// import { TMDB_CONFIG } from '../config/constants.js';
// import axios from 'axios';
// import { cleanFileName } from '../utils/cleaner.js';
// import { getLibraryPaths, getMappings } from '../utils/storage.js';

// const delay = (ms) => new Promise(res => setTimeout(res, ms));

// async function getPoster(fileName, mappings) {
//     if (mappings && mappings[fileName]) return mappings[fileName]; 
//     const token = process.env.TMDB_TOKEN;
//     if (!token) return null;
    
//     try {
//         const cleanName = cleanFileName(fileName);
//         await delay(50); 
//         const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/multi`, {
//             params: { query: cleanName, language: 'es-ES' },
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         if (response.data.results?.length > 0) {
//             const best = response.data.results.find(r => r.poster_path);
//             return best ? `https://image.tmdb.org/t/p/w500${best.poster_path}` : null;
//         }
//     } catch (err) { return null; }
//     return null;
// }

// export const buildIndex = async () => {
//     try {
//         const paths = await getLibraryPaths();
//         const mappings = await getMappings();
//         let allMovies = [];
//         for (const folder of paths) {
//             try {
//                 const files = await fs.readdir(folder);
//                 for (const file of files) {
//                     if (file.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)) {
//                         const poster = await getPoster(file, mappings);
//                         allMovies.push({
//                             name: file,
//                             path: path.join(folder, file),
//                             poster: poster,
//                             category: path.basename(folder)
//                         });
//                     }
//                 }
//             } catch (e) { console.error("Error en carpeta", folder); }
//         }
//         return allMovies.map((movie, i) => ({ ...movie, index: i }));
//     } catch (error) { return []; }
// };


