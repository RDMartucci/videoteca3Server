// src/services/indexer.service.js
// este servicio se encarga de escanear las carpetas de la biblioteca, extraer información 
// de los archivos de video y almacenar esa información en la base de datos. 
// También se encarga de limpiar los nombres de los archivos para facilitar las búsquedas 
// y la organización.
// El proceso de indexación se realiza de la siguiente manera:
// 1. Se obtienen las rutas de las carpetas de la biblioteca utilizando la función getLibraryPaths().
// 2. Para cada carpeta, se leen los archivos y se filtran aquellos que son videos basándose en sus extensiones.  
// 3. Para cada archivo de video, se extrae información relevante como el nombre del archivo, el tamaño, la fecha de creación, etc. 
// 4. Se limpia el nombre del archivo utilizando la función cleanFileName() para obtener un título más legible.
// 5. Se almacena toda esta información en la base de datos utilizando una transacción para asegurar la integridad de los datos.
// 6. Finalmente, se invalida la caché para que las nuevas entradas estén disponibles para las consultas posteriores.
// Este servicio es fundamental para mantener la biblioteca de medios actualizada y organizada, 
// permitiendo a los usuarios acceder a su contenido de manera eficiente.
// Nota: Este servicio asume que la base de datos y las tablas necesarias ya están configuradas correctamente.
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

