// src/controllers/browse.controller.js
//
// Este controlador maneja la lógica para obtener y guardar la configuración de rutas,
// así como para obtener el contenido de la biblioteca, reproducir películas, 
// buscar detalles en TMDB y corregir mapeos manuales.  
/********************************************************************************************** */

import { exec } from 'child_process';
import logger from '../config/logger.js';//
import { saveMapping, getMappings } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';
import { cleanFileName } from '../utils/cleaner.js';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.resolve('settings.json');// Cargamos el Token desde las variables de entorno.

export const getSettings = async (req, res) => {//
    try {// Intentamos leer el archivo de configuración settings.json. Si existe, lo parseamos y verificamos si la lista de rutas está vacía.
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');// Si el archivo existe, pero la lista de rutas está vacía, consideramos que es el primer inicio
        const settings = JSON.parse(data);// Si el archivo existe pero la lista de rutas está vacía, isFirstStart será true
        res.json({ ...settings, isFirstStart: !settings.paths || settings.paths.length === 0 });// Si el archivo existe pero la lista de rutas está vacía
    } catch (error) {// Si el archivo ni siquiera existe, es el primer inicio absoluto
        res.json({ paths: [], isFirstStart: true });// Si el archivo ni siquiera existe, es el primer inicio absoluto
    }
};

export const saveSettings = async (req, res) => {
    try {// Extraemos las rutas del cuerpo de la solicitud. Si no se proporcionan, usamos un array vacío por defecto.
        const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
        await fs.writeFile(SETTINGS_FILE, JSON.stringify({ paths }, null, 2));// Guardamos las rutas en settings.json. El segundo argumento de JSON.stringify es null para no modificar la estructura, y el tercero es 2 para formatear con indentación de 2 espacios.
        logger.info("⚙️ Indexando nuevas rutas...");// Iniciamos el proceso de indexación inmediatamente después de guardar la configuración. Si buildIndex es asíncrono, el 'await' hará que el spinner en el front se mantenga activo hasta que termine de procesar las carpetas.
        const movies = await buildIndex(); // Esperamos a que buildIndex termine para asegurarnos de que el índice se ha actualizado antes de responder al cliente.
        res.json({ message: "Configuración guardada", movies });// Respondemos con un mensaje de éxito y opcionalmente con la lista de películas indexadas.
    } catch (error) {// Si ocurre un error al guardar la configuración o durante el proceso de indexación, lo registramos y respondemos con un error 500.
        logger.error("Error al guardar settings:", error);// Registramos el error para diagnóstico.
        res.status(500).json({ error: "No se pudieron guardar los ajustes" });// Respondemos con un error 500 indicando que no se pudieron guardar los ajustes.
    }
};

export const getExplorerContent = async (req, res) => {
    try {// Llamamos a buildIndex para obtener el contenido de la biblioteca. Aseguramos que la respuesta sea un array antes de enviarla al cliente.
        const results = await buildIndex();// Forzamos que sea un array antes de enviarlo. Esto es importante para evitar errores en el frontend si buildIndex devuelve algo inesperado.
        res.json(Array.isArray(results) ? results : []);// Si buildIndex no devuelve un array, respondemos con un array vacío para mantener la consistencia en el frontend.
    } catch (error) {// Si ocurre un error durante la obtención del contenido, lo registramos y respondemos con un array vacío para que el frontend no rompa.
        logger.error("Error al obtener contenido del explorador:", error);// Registramos el error para diagnóstico.
        res.status(500).json([]);// Respondemos con un array vacío para que el frontend no rompa.
    }
};

export const playMovie = async (req, res) => {
    try {
        const index = req.body?.index;
        const movies = await buildIndex();
        const movie = movies.find(m => m.index === index);
        if (!movie) return res.status(404).json({ error: "Video no encontrado" });
        exec(`start "" "${movie.path}"`);
        res.json({ message: "Reproduciendo..." });
    } catch (error) {
        logger.error("Error en playMovie:", error);
        res.status(500).json({ error: "No se pudo reproducir el video" });
    }
};

// --- CORREGIDO: getMovieDetails con limpieza y manejo de errores ---
export const getMovieDetails = async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID faltante" });

    try {
        // Limpiamos el nombre antes de buscar para evitar el error 500
        const cleanQuery = cleanFileName(id);
        
        const searchInTMDB = async (query) => {
            const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
            const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } });
            if (!r.ok) {
                const errBody = await r.json().catch(() => ({}));
                throw new Error(errBody.status_message || `TMDB ${r.status}: ${r.statusText}`);
            }
            return await r.json();
        };

        let searchData = await searchInTMDB(cleanQuery);

        if (!searchData.results || searchData.results.length === 0) {
            return res.json({ noData: true, title: cleanQuery });
        }

        const topResult = searchData.results[0];
        const detailUrl = `https://api.themoviedb.org/3/${topResult.media_type || 'movie'}/${topResult.id}?language=es-ES&append_to_response=credits,videos`;
        const detailRes = await fetch(detailUrl, {
            headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` }
        });
        if (!detailRes.ok) {
            const errBody = await detailRes.json().catch(() => ({}));
            throw new Error(errBody.status_message || `TMDB ${detailRes.status}: ${detailRes.statusText}`);
        }
        const data = await detailRes.json();

        res.json({
            title: data.title || data.name,
            overview: data.overview,
            year: (data.release_date || data.first_air_date || "").split('-')[0],
            backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
            poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
            genres: data.genres?.map(g => g.name) || [],
            cast: data.credits?.cast?.slice(0, 5).map(c => c.name) || [],
            director: data.credits?.crew?.find(c => c.job === "Director")?.name,
            trailerId: data.videos?.results?.find(v => v.type === "Trailer")?.key,
            runtime: data.runtime,
            rating: data.vote_average
        });
    } catch (error) {
        console.error("❌ Error en detalles:", error);
        res.status(500).json({ error: "Error en el servidor al buscar en TMDB" });
    }
};

export const searchTMDBOptions = async (req, res) => {
    const query = req.query.query || req.query.id; // Soporta ambos parámetros
    if (!query) return res.json([]);
    try {
        const cleanQuery = cleanFileName(query);
        const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(cleanQuery)}&language=es-ES`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } });
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.status_message || `TMDB ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        res.json((data.results || []).slice(0, 9).map(item => ({
            id: item.id,
            title: item.title || item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            year: (item.release_date || item.first_air_date || "").split('-')[0]
        })));
    } catch (error) {
        res.status(500).json([]);
    }
};

export const fixMatch = async (req, res) => {
    try {
        const { fileName, posterUrl } = req.body || {};
        if (!fileName || !posterUrl) {
            return res.status(400).json({ error: "Faltan fileName o posterUrl" });
        }
        await saveMapping(fileName, posterUrl); 
        await buildIndex(); 
        res.json({ message: "Poster actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "No se pudo guardar la elección" });
    }
};


/****************************************************************************************** */
// import { exec } from 'child_process';
// import logger from '../config/logger.js';
// import { saveMapping, getMappings } from '../utils/storage.js';
// import { buildIndex } from '../services/indexer.service.js';
// import fs from 'fs/promises';
// import path from 'path';

// const SETTINGS_FILE = path.resolve('settings.json');

// // Leer configuración
// export const getSettings = async (req, res) => {
//     try {
//         const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
//         const settings = JSON.parse(data);
//         res.json({ ...settings, isFirstStart: settings.paths.length === 0 });
//     } catch (error) {
//         res.json({ paths: [], isFirstStart: true });
//     }
// };

// // Guardar configuración
// export const saveSettings = async (req, res) => {
//     try {
//         const { paths } = req.body;
//         // Guardar archivo settings.json
//         await fs.writeFile(SETTINGS_FILE, JSON.stringify({ paths }, null, 2));
        
//         // Disparar el indexador inmediatamente
//         logger.info("⚙️ Iniciando indexación tras cambio de configuración...");
//         const movies = await buildIndex(); 
        
//         res.json({ message: "Configuración guardada", movies });
//     } catch (error) {
//         logger.error("Error al guardar settings:", error);
//         res.status(500).json({ error: "No se pudieron guardar los ajustes" });
//     }
// };
// // export const saveSettings = async (req, res) => {
// //     try {
// //         const { paths } = req.body;
// //         await fs.writeFile(SETTINGS_FILE, JSON.stringify({ paths }, null, 2));
// //         await buildIndex(); 
// //         res.json({ message: "Configuración actualizada y escaneo completado" });
// //     } catch (error) {
// //         res.status(500).json({ error: "Error al procesar la solicitud" });
// //     }
// // };

// export const getExplorerContent = async (req, res) => {
//     try {
//         const results = await buildIndex();
//         res.json(Array.isArray(results) ? results : []);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json([]);
//     }
// };

// export const playMovie = async (req, res) => {
//     const { index } = req.body;
//     const movies = await buildIndex();
//     const movie = movies.find(m => m.index === index);

//     if (!movie) return res.status(404).json({ error: "Video no encontrado" });

//     logger.info(`🎬 Ejecutando: ${movie.path}`);
//     const command = `start "" "${movie.path}"`;

//     exec(command, (err) => {
//         if (err) {
//             logger.error(`❌ Falló al abrir: ${err.message}`);
//             return res.status(500).json({ error: "No se pudo abrir el archivo" });
//         }
//     });

//     res.json({ message: "Reproduciendo..." });
// };

// export const getMovieDetails = async (req, res) => {
//     let { id } = req.query;
//     if (!id) return res.status(400).json({ error: "ID faltante" });

//     try {
//         const searchInTMDB = async (query) => {
//             const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
//             const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } });
//             return await r.json();
//         };

//         let searchData = await searchInTMDB(id);

//         if (!searchData.results || searchData.results.length === 0) {
//             const retryQuery = id.replace(/\b\d{4}\b/g, '').replace(/\b\d+\b$/g, '').trim();
//             searchData = await searchInTMDB(retryQuery);
//         }

//         if (!searchData.results || searchData.results.length === 0) {
//             return res.json({ noData: true, title: id });
//         }

//         const topResult = searchData.results[0];
//         const detailUrl = `https://api.themoviedb.org/3/${topResult.media_type || 'movie'}/${topResult.id}?language=es-ES&append_to_response=credits,videos`;
//         const detailRes = await fetch(detailUrl, {
//             headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` }
//         });
//         const data = await detailRes.json();

//         res.json({
//             title: data.title || data.name,
//             overview: data.overview,
//             year: (data.release_date || data.first_air_date || "").split('-')[0],
//             backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
//             genres: data.genres?.map(g => g.name) || [],
//             cast: data.credits?.cast?.slice(0, 5).map(c => c.name) || [],
//             director: data.credits?.crew?.find(c => c.job === "Director")?.name,
//             trailerId: data.videos?.results?.find(v => v.type === "Trailer")?.key,
//             runtime: data.runtime,
//             rating: data.vote_average
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error en el servidor" });
//     }
// };

// // --- CORREGIDO: searchTMDBOptions ---
// export const searchTMDBOptions = async (req, res) => {
//     const { query } = req.query;
//     if (!query) return res.json([]);

//     try {
//         const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
//         const response = await fetch(url, { 
//             headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } 
//         });
//         const data = await response.json();

//         const candidates = (data.results || []).slice(0, 9).map(item => ({
//             id: item.id,
//             type: item.media_type || 'movie',
//             title: item.title || item.name,
//             // CORRECCIÓN: Enviamos la URL completa y usamos el nombre 'poster' para consistencia con tu Front
//             poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
//             year: (item.release_date || item.first_air_date || "").split('-')[0]
//         }));
        
//         res.json(candidates);
//     } catch (error) {
//         console.error("❌ Error en searchTMDBOptions:", error);
//         res.status(500).json({ error: "Error al buscar opciones" });
//     }
// };
// export const fixMatch = async (req, res) => {
//     try {
//         const { fileName, posterUrl } = req.body;
//         await saveMapping(fileName, posterUrl); 
//         await buildIndex(); 
//         res.json({ message: "Poster actualizado correctamente" });
//     } catch (error) {
//         logger.error(`❌ Error en fixMatch: ${error.message}`);
//         res.status(500).json({ error: "No se pudo guardar la elección" });
//     }
// };

// // export const searchTMDBOptions = async (req, res) => {
// //     const { query } = req.query;
// //     if (!query) return res.json([]);

// //     try {
// //         const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
// //         const response = await fetch(url, { 
// //             headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } 
// //         });
// //         const data = await response.json(); // Aquí se define 'data'

// //         const candidates = (data.results || []).slice(0, 9).map(item => ({
// //             id: item.id,
// //             type: item.media_type || 'movie',
// //             title: item.title || item.name,
// //             poster_path: item.poster_path, // Importante para la Card
// //             release_date: item.release_date || item.first_air_date
// //         }));
        
// //         res.json(candidates);
// //     } catch (error) {
// //         console.error("❌ Error en searchTMDBOptions:", error);
// //         res.status(500).json({ error: "Error al buscar opciones" });
// //     }
// // };





// // import { exec } from 'child_process';
// // import logger from '../config/logger.js';
// // import { saveMapping, getMappings } from '../utils/storage.js';
// // import { buildIndex } from '../services/indexer.service.js';
// // import fs from 'fs/promises';
// // import path from 'path';
// // import { clear } from 'console';

// // const SETTINGS_PATH = path.resolve('settings.json');

// // // Cargamos el Token desde las variables de entorno
// // const TMDB_TOKEN = process.env.TMDB_TOKEN;

// // // Leer configuración.
// // export const getSettings = async (req, res) => {
// //     try {
// //         const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
// //         const settings = JSON.parse(data);
// //         // Si el archivo existe pero la lista de rutas está vacía
// //         res.json({ ...settings, isFirstStart: settings.paths.length === 0 });
// //     } catch (error) {
// //         // Si el archivo ni siquiera existe, es el primer inicio absoluto
// //         res.json({ paths: [], isFirstStart: true });
// //     }
// // };

// // // Guardar configuración.
// // export const saveSettings = async (req, res) => {
// //     try {
// //         const { paths } = req.body;
        
// //         // Guardar las rutas
// //         await fs.writeFile(SETTINGS_FILE, JSON.stringify({ paths }, null, 2));
        
// //         // Iniciar el escaneo inmediatamente
// //         // Si buildIndex es asíncrono, el 'await' hará que el spinner en el front
// //         // se mantenga activo hasta que termine de procesar las carpetas.
// //         await buildIndex(); 

// //         res.json({ message: "Configuración actualizada y escaneo completado" });
// //     } catch (error) {
// //         res.status(500).json({ error: "Error al procesar la solicitud" });
// //     }
// // };


// // /**
// //  * Obtiene el contenido de la biblioteca.
// //  * Se cambió a async para poder reconstruir el índice dinámicamente
// //  * basado en las rutas configuradas en settings.json.
// //  */
// // export const getExplorerContent = async (req, res) => {
// //     try {
// //         const results = await buildIndex();
// //         // Forzamos que sea un array antes de enviarlo
// //         res.json(Array.isArray(results) ? results : []);
// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).json([]); // ENVIAR ARRAY VACÍO SIEMPRE
// //     }
// // };

// // /**
// //  * Lógica para reproducir el video en el reproductor predeterminado del sistema.
// //  */
// // export const playMovie = async (req, res) => {
// //     const { index } = req.body;
    
// //     // Obtenemos la lista actual para buscar el path del video
// //     const movies = await buildIndex();
// //     const movie = movies.find(m => m.index === index);

// //     if (!movie) return res.status(404).json({ error: "Video no encontrado" });

// //     logger.info(`🎬 Ejecutando: ${movie.path}`);

// //     // Comando compatible con Windows para manejar espacios y caracteres especiales
// //     const command = `start "" "${movie.path}"`;

// //     exec(command, (err) => {
// //         if (err) {
// //             logger.error(`❌ Falló al abrir: ${err.message}`);
// //             return res.status(500).json({ error: "No se pudo abrir el archivo" });
// //         }
// //     });

// //     res.json({ message: "Reproduciendo..." });
// // };

// // /*
// //  Busca candidatos en TMDB (Multi-search: Películas y Series)
// //  Obtiene detalles profundos de una película/serie por ID de TMDB
// //  */

// // export const getMovieDetails = async (req, res) => {
// //     let { id } = req.query;
// //     if (!id) return res.status(400).json({ error: "ID faltante" });

// //     try {
// //         let tmdbId = null;
// //         let mediaType = 'movie';

// //         // Función interna para buscar en TMDB
// //         const searchInTMDB = async (query) => {
// //             const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
// //             const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } });
// //             return await r.json();
// //         };

// //         // INTENTO 1: Búsqueda original
// //         let searchData = await searchInTMDB(id);

// //         // INTENTO 2: Si falló, quitamos años (4 dígitos) y números sueltos al final
// //         if (!searchData.results || searchData.results.length === 0) {
// //             const retryQuery = id.replace(/\b\d{4}\b/g, '').replace(/\b\d+\b$/g, '').trim();
// //             console.log(`⚠️ Falló búsqueda 1. Reintentando con: "${retryQuery}"`);
// //             searchData = await searchInTMDB(retryQuery);
// //         }

// //         if (!searchData.results || searchData.results.length === 0) {
// //             // Si después de limpiar sigue fallando, enviamos un 200 con "no encontrado" 
// //             // en lugar de 404 para que el frontend no rompa Axios.
// //             return res.json({ noData: true, title: id });
// //         }

// //         const topResult = searchData.results[0];
// //         tmdbId = topResult.id;
// //         mediaType = topResult.media_type || 'movie';

// //         // Obtener detalles reales
// //         const detailUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?language=es-ES&append_to_response=credits,videos`;
// //         const detailRes = await fetch(detailUrl, {
// //             headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` }
// //         });
// //         const data = await detailRes.json();

// //         // Responder con la data completa
// //         res.json({
// //             title: data.title || data.name,
// //             overview: data.overview,
// //             year: (data.release_date || data.first_air_date || "").split('-')[0],
// //             backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
// //             genres: data.genres?.map(g => g.name) || [],
// //             cast: data.credits?.cast?.slice(0, 5).map(c => c.name) || [],
// //             director: data.credits?.crew?.find(c => c.job === "Director")?.name,
// //             trailerId: data.videos?.results?.find(v => v.type === "Trailer")?.key,
// //             runtime: data.runtime,
// //             rating: data.vote_average
// //         });

// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).json({ error: "Error en el servidor" });
// //     }
// // };

// // export const searchTMDBOptions = async (req, res) => {
// //     // ... (tu código anterior igual hasta el map)
// //     const candidates = (data.results || []).slice(0, 9).map(item => ({
// //         id: item.id,
// //         type: item.media_type || 'movie', // <--- Importante añadir esto
// //         title: item.title || item.name,
// //         // ... (resto igual)
// //     }));
// //     res.json(candidates);
// // };

// // /**
// //  * Guarda la elección de poster del usuario en data.json
// //  * y refresca el índice.
// //  */
// // export const fixMatch = async (req, res) => {
// //     try {
// //         const { fileName, posterUrl } = req.body;
// //         // Guardamos en data.json usando nuestra utilidad storage.js
// //         await saveMapping(fileName, posterUrl); 
        
// //         // Al ejecutar buildIndex() aquí, nos aseguramos de que el cambio sea persistente
// //         await buildIndex(); 
        
// //         res.json({ message: "Poster actualizado correctamente" });
// //     } catch (error) {
// //         logger.error(`❌ Error en fixMatch: ${error.message}`);
// //         res.status(500).json({ error: "No se pudo guardar la elección" });
// //     }
// // };
