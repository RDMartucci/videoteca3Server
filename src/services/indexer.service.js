// src/services/indexer.service.js (version mejorada con búsqueda automática de pósters)
//
// Servicio de indexación de películas con búsqueda automática de pósters en TMDB
// Si no se encuentra un mapeo manual, se intenta buscar el póster usando la API de TMDB
// con un token de autenticación para mayor consistencia.
//

import fs from 'fs/promises';
import path from 'path';
import { TMDB_CONFIG } from '../config/constants.js';
import axios from 'axios';
import { cleanFileName } from '../utils/cleaner.js';
import { getLibraryPaths, getMappings } from '../utils/storage.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getPoster(fileName, mappings) {
    if (mappings && mappings[fileName]) return mappings[fileName]; 
    const token = process.env.TMDB_TOKEN;
    if (!token) return null;
    
    try {
        const cleanName = cleanFileName(fileName);
        await delay(50); 
        const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/multi`, {
            params: { query: cleanName, language: 'es-ES' },
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.results?.length > 0) {
            const best = response.data.results.find(r => r.poster_path);
            return best ? `https://image.tmdb.org/t/p/w500${best.poster_path}` : null;
        }
    } catch (err) { return null; }
    return null;
}

export const buildIndex = async () => {
    try {
        const paths = await getLibraryPaths();
        const mappings = await getMappings();
        let allMovies = [];
        for (const folder of paths) {
            try {
                const files = await fs.readdir(folder);
                for (const file of files) {
                    if (file.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)) {
                        const poster = await getPoster(file, mappings);
                        allMovies.push({
                            name: file,
                            path: path.join(folder, file),
                            poster: poster,
                            category: path.basename(folder)
                        });
                    }
                }
            } catch (e) { console.error("Error en carpeta", folder); }
        }
        return allMovies.map((movie, i) => ({ ...movie, index: i }));
    } catch (error) { return []; }
};

/****************************************************************************************** */
// import fs from 'fs/promises';
// import path from 'path';
// import { TMDB_CONFIG } from '../config/constants.js';
// import logger from '../config/logger.js';
// import axios from 'axios';
// import { cleanFileName } from '../utils/cleaner.js';
// import { getLibraryPaths, getMappings } from '../utils/storage.js';

// // Función para añadir un pequeño delay y evitar bloqueos de TMDB
// const delay = (ms) => new Promise(res => setTimeout(res, ms));

// async function getPoster(fileName, mappings) {
//     // 1. PRIORIDAD: Mapeo manual guardado en data.json (Fix Match)
//     if (mappings && mappings[fileName]) {
//         return mappings[fileName]; 
//     }

//     // 2. BÚSQUEDA AUTOMÁTICA
//     // Usamos el Token de las variables de entorno para consistencia
//     const token = process.env.TMDB_TOKEN;
//     if (!token) return null;
    
//     try {
//         const cleanName = cleanFileName(fileName);
        
//         // Pequeña pausa para no saturar la API en escaneos masivos
//         await delay(50); 

//         const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/multi`, {
//             params: { 
//                 query: cleanName, 
//                 language: 'es-ES' 
//             },
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         if (response.data.results && response.data.results.length > 0) {
//             // Buscamos el primer resultado que tenga póster
//             const bestMatch = response.data.results.find(r => r.poster_path);
//             if (bestMatch) {
//                 return `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`;
//             }
//         }
//     } catch (err) {
//         logger.error(`Error buscando póster para ${fileName}: ${err.message}`);
//         return null;
//     }
//     return null;
// }

// export const buildIndex = async () => {
//     try {
//         const paths = await getLibraryPaths();
//         const mappings = await getMappings();
//         let allMovies = [];

//         if (!paths || paths.length === 0) return [];

//         for (const folder of paths) {
//             try {
//                 const files = await fs.readdir(folder);

//                 // Procesamos uno por uno para respetar los límites de la API
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
//             } catch (e) {
//                 logger.error(`Ruta inaccesible: ${folder}`);
//             }
//         }

//         // Asignamos índices únicos al final
//         return allMovies.map((movie, i) => ({ ...movie, index: i }));

//     } catch (error) {
//         logger.error("Error en indexer:", error);
//         return [];
//     }
// };

/****************************************************************************************** */
// import fs from 'fs/promises';
// import path from 'path';
// import { TMDB_CONFIG } from '../config/constants.js';
// import logger from '../config/logger.js';
// import axios from 'axios';
// import { cleanFileName } from '../utils/cleaner.js';
// import { getLibraryPaths, getMappings } from '../utils/storage.js';

// async function getPoster(fileName, mappings) {
//     // 1. Prioridad Absoluta: Mapeo manual guardado en data.json
//     if (mappings && mappings[fileName]) {
//         return mappings[fileName]; 
//     }

//     // 2. Búsqueda automática en TMDB
//     if (!TMDB_CONFIG.apiKey) return null;
    
//     try {
//         const cleanName = cleanFileName(fileName);
//         const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/movie`, {
//             params: { 
//                 api_key: TMDB_CONFIG.apiKey, 
//                 query: cleanName, 
//                 language: 'es-ES' 
//             }
//         });

//         if (response.data.results && response.data.results.length > 0) {
//             const posterPath = response.data.results[0].poster_path;
//             // Retornamos URL completa
//             return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
//         }
//     } catch (err) {
//         return null;
//     }
//     return null;
// }

// export const buildIndex = async () => {
//     try {
//         const paths = await getLibraryPaths();
//         const mappings = await getMappings(); // Cargamos los posters manuales
//         let allMovies = [];

//         if (!paths || paths.length === 0) return [];

//         for (const folder of paths) {
//             try {
//                 const files = await fs.readdir(folder);

//                 const moviePromises = files.map(async (file) => {
//                     if (file.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)) {
//                         const poster = await getPoster(file, mappings);
//                         return {
//                             name: file,
//                             path: path.join(folder, file),
//                             poster: poster,
//                             category: path.basename(folder)
//                         };
//                     }
//                     return null;
//                 });

//                 const results = await Promise.all(moviePromises);
//                 allMovies.push(...results.filter(m => m !== null));
//             } catch (e) {
//                 logger.error(`Ruta inaccesible: ${folder}`);
//             }
//         }

//         // Asignamos índices únicos al final
//         return allMovies.map((movie, i) => ({ ...movie, index: i }));

//     } catch (error) {
//         logger.error("Error en indexer:", error);
//         return [];
//     }
// };
