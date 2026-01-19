// src/controllers/browse.controller.js
import { exec } from 'child_process';
import logger from '../config/logger.js';
import { saveMapping, getMappings } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';

// Cargamos el Token desde las variables de entorno
const TMDB_TOKEN = process.env.TMDB_TOKEN;

/**
 * Obtiene el contenido de la biblioteca.
 * Se cambió a async para poder reconstruir el índice dinámicamente
 * basado en las rutas configuradas en settings.json.
 */
export const getExplorerContent = async (req, res) => {
    try {
        const results = await buildIndex();
        // Forzamos que sea un array antes de enviarlo
        res.json(Array.isArray(results) ? results : []);
    } catch (error) {
        console.error(error);
        res.status(500).json([]); // ENVIAR ARRAY VACÍO SIEMPRE
    }
};

/**
 * Lógica para reproducir el video en el reproductor predeterminado del sistema.
 */
export const playMovie = async (req, res) => {
    const { index } = req.body;
    
    // Obtenemos la lista actual para buscar el path del video
    const movies = await buildIndex();
    const movie = movies.find(m => m.index === index);

    if (!movie) return res.status(404).json({ error: "Video no encontrado" });

    logger.info(`🎬 Ejecutando: ${movie.path}`);

    // Comando compatible con Windows para manejar espacios y caracteres especiales
    const command = `start "" "${movie.path}"`;

    exec(command, (err) => {
        if (err) {
            logger.error(`❌ Falló al abrir: ${err.message}`);
            return res.status(500).json({ error: "No se pudo abrir el archivo" });
        }
    });

    res.json({ message: "Reproduciendo..." });
};

/**
 * Busca candidatos en TMDB (Multi-search: Películas y Series)
 */
/**
 * Obtiene detalles profundos de una película/serie por ID de TMDB
 */
// src/controllers/browse.controller.js

export const getMovieDetails = async (req, res) => {
    let { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID faltante" });

    try {
        let tmdbId = null;
        let mediaType = 'movie';

        // Función interna para buscar en TMDB
        const searchInTMDB = async (query) => {
            const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
            const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } });
            return await r.json();
        };

        // INTENTO 1: Búsqueda original
        let searchData = await searchInTMDB(id);

        // INTENTO 2: Si falló, quitamos años (4 dígitos) y números sueltos al final
        if (!searchData.results || searchData.results.length === 0) {
            const retryQuery = id.replace(/\b\d{4}\b/g, '').replace(/\b\d+\b$/g, '').trim();
            console.log(`⚠️ Falló búsqueda 1. Reintentando con: "${retryQuery}"`);
            searchData = await searchInTMDB(retryQuery);
        }

        if (!searchData.results || searchData.results.length === 0) {
            // Si después de limpiar sigue fallando, enviamos un 200 con "no encontrado" 
            // en lugar de 404 para que el frontend no rompa Axios.
            return res.json({ noData: true, title: id });
        }

        const topResult = searchData.results[0];
        tmdbId = topResult.id;
        mediaType = topResult.media_type || 'movie';

        // Obtener detalles reales
        const detailUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?language=es-ES&append_to_response=credits,videos`;
        const detailRes = await fetch(detailUrl, {
            headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` }
        });
        const data = await detailRes.json();

        // Responder con la data completa
        res.json({
            title: data.title || data.name,
            overview: data.overview,
            year: (data.release_date || data.first_air_date || "").split('-')[0],
            backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
            genres: data.genres?.map(g => g.name) || [],
            cast: data.credits?.cast?.slice(0, 5).map(c => c.name) || [],
            director: data.credits?.crew?.find(c => c.job === "Director")?.name,
            trailerId: data.videos?.results?.find(v => v.type === "Trailer")?.key,
            runtime: data.runtime,
            rating: data.vote_average
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};
/************************************************************************ */
// export const getMovieDetails = async (req, res) => {
//     const { id } = req.query;
//     console.log("🔍 [Backend] Buscando detalles para:", id);

//     if (!id || id === 'undefined') {
//         return res.status(400).json({ error: "Query inválida" });
//     }

//     try {
//         let tmdbId = id;
//         let mediaType = 'movie';

//         // 1. Si NO es un ID numérico (es un nombre), buscar el ID primero
//         if (isNaN(id)) {
//             console.log("➡️ [Backend] El ID no es numérico, buscando ID en TMDB para:", id);
//             const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(id)}&language=es-ES`;
            
//             const searchRes = await fetch(searchUrl, {
//                 headers: { 
//                     'Authorization': `Bearer ${process.env.TMDB_TOKEN}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//             const searchData = await searchRes.json();

//             if (!searchData.results || searchData.results.length === 0) {
//                 console.log("❌ [Backend] No se encontró nada en TMDB para ese nombre.");
//                 return res.status(404).json({ error: "No encontrado" });
//             }

//             tmdbId = searchData.results[0].id;
//             mediaType = searchData.results[0].media_type || 'movie';
//             console.log(`✅ [Backend] ID encontrado: ${tmdbId} (${mediaType})`);
//         }

//         // 2. Obtener detalles extendidos
//         const detailUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?language=es-ES&append_to_response=credits,videos`;
//         const detailRes = await fetch(detailUrl, {
//             headers: { 
//                 'Authorization': `Bearer ${process.env.TMDB_TOKEN}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const data = await detailRes.json();

//         // 3. Formatear respuesta
//         const trailer = data.videos?.results?.find(v => 
//             v.type === "Trailer" && (v.iso_639_1 === "es" || v.name.toLowerCase().includes("latino"))
//         ) || data.videos?.results?.find(v => v.type === "Trailer");

//         res.json({
//             title: data.title || data.name,
//             overview: data.overview,
//             genres: data.genres?.map(g => g.name) || [],
//             runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
//             cast: data.credits?.cast?.slice(0, 5).map(c => c.name) || [],
//             director: data.credits?.crew?.find(c => c.job === "Director")?.name,
//             backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
//             trailerId: trailer?.key,
//             rating: data.vote_average,
//             year: (data.release_date || data.first_air_date || "").split('-')[0]
//         });

//     } catch (error) {
//         console.error("❌ [Backend] Error crítico:", error.message);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
// export const getMovieDetails = async (req, res) => {
//     let { id } = req.query; // Puede venir un ID (123) o un nombre ("Matrix")
//     if (!id) return res.status(400).json({ error: "Query requerida" });

//     try {
//         let tmdbId = id;

//         // Si 'id' NO es un número, es un nombre sucio o limpio, buscamos el ID primero
//         if (isNaN(id)) {
//             const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(id)}&language=es-ES`;
//             const searchRes = await fetch(searchUrl, {
//                 headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
//             });
//             const searchData = await searchRes.json();
            
//             if (!searchData.results || searchData.results.length === 0) {
//                 return res.status(404).json({ error: "No se encontró en TMDB" });
//             }
//             tmdbId = searchData.results[0].id;
//             // También detectamos si es 'movie' o 'tv'
//             var mediaType = searchData.results[0].media_type || 'movie';
//         } else {
//             var mediaType = req.query.type || 'movie';
//         }

//         // Ahora pedimos los detalles reales con el ID numérico
//         const detailUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?language=es-ES&append_to_response=credits,videos`;
//         const detailRes = await fetch(detailUrl, {
//             headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
//         });
//         const data = await detailRes.json();

//         const trailer = data.videos?.results.find(v => 
//             v.type === "Trailer" && (v.iso_639_1 === "es" || v.name.toLowerCase().includes("latino"))
//         ) || data.videos?.results.find(v => v.type === "Trailer");

//         res.json({
//             title: data.title || data.name,
//             overview: data.overview,
//             genres: data.genres?.map(g => g.name),
//             runtime: data.runtime || data.episode_run_time?.[0],
//             cast: data.credits?.cast.slice(0, 5).map(c => c.name),
//             director: data.credits?.crew.find(c => c.job === "Director")?.name,
//             backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
//             trailerId: trailer?.key,
//             rating: data.vote_average,
//             year: (data.release_date || data.first_air_date || "").split('-')[0]
//         });

//     } catch (error) {
//         console.error("Error profundo en TMDB:", error);
//         res.status(500).json({ error: "Error de servidor" });
//     }
// };
// export const getMovieDetails = async (req, res) => {
//     // const { id, type = 'movie' } = req.query; // type puede ser 'movie' o 'tv'
//     let { id } = req.query; // Puede venir un ID (123) o un nombre ("Matrix")
//     if (!id) return res.status(400).json({ error: "Query requerida" });
//     // if (!id) return res.status(400).json({ error: "ID requerido" });

//     // Pedimos detalles, créditos (casting) y videos (trailers) en una sola llamada
//     const url = `https://api.themoviedb.org/3/${type}/${id}?language=es-ES&append_to_response=credits,videos`;
    
//     const options = {
//         method: 'GET',
//         headers: {
//             accept: 'application/json',
//             Authorization: `Bearer ${TMDB_TOKEN}`
//         }
//     };

//     try {
//         const response = await fetch(url, options);
//         const data = await response.json();

//         // Buscamos un trailer en español o latino
//         const trailer = data.videos?.results.find(v => 
//             v.type === "Trailer" && (v.iso_639_1 === "es" || v.name.toLowerCase().includes("latino"))
//         ) || data.videos?.results.find(v => v.type === "Trailer"); // Backup: cualquier trailer

//         res.json({
//             overview: data.overview,
//             genres: data.genres?.map(g => g.name),
//             runtime: data.runtime || data.episode_run_time?.[0],
//             cast: data.credits?.cast.slice(0, 5).map(c => c.name),
//             director: data.credits?.crew.find(c => c.job === "Director")?.name,
//             backdrop: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
//             trailerId: trailer?.key,
//             rating: data.vote_average
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Error al obtener detalles" });
//     }
// };

/**
 * Modificamos searchTMDBOptions para incluir el "media_type" 
 * necesario para saber si es película o serie al buscar detalles.
 */
/************************************************************************* */
export const searchTMDBOptions = async (req, res) => {
    // ... (tu código anterior igual hasta el map)
    const candidates = (data.results || []).slice(0, 9).map(item => ({
        id: item.id,
        type: item.media_type || 'movie', // <--- Importante añadir esto
        title: item.title || item.name,
        // ... (resto igual)
    }));
    res.json(candidates);
};

// export const searchTMDBOptions = async (req, res) => {
//     const { query } = req.query;
//     console.log("📥 Servidor recibió query:", `"${query}"`);
    
//     if (!query || query === "undefined" || query.trim() === "") {
//         return res.json([]);
//     }

//     const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
    
//     const options = {
//         method: 'GET',
//         headers: {
//             accept: 'application/json',
//             Authorization: `Bearer ${TMDB_TOKEN}`
//         }
//     };

//     try {
//         const response = await fetch(url, options);
//         const data = await response.json();

//         // Mapeamos los resultados para que el Modal los entienda
//         const candidates = (data.results || []).slice(0, 9).map(item => ({
//             id: item.id,
//             title: item.title || item.name,
//             year: (item.release_date || item.first_air_date || "").split('-')[0],
//             poster: item.poster_path 
//                 ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
//                 : 'https://via.placeholder.com/500x750?text=Sin+Imagen',
//         }));
        
//         res.json(candidates);
//     } catch (error) {
//         console.error("Error en búsqueda TMDB:", error);
//         res.status(500).json([]);
//     }
// };

/**
 * Guarda la elección de poster del usuario en data.json
 * y refresca el índice.
 */
export const fixMatch = async (req, res) => {
    try {
        const { fileName, posterUrl } = req.body;
        // Guardamos en data.json usando nuestra utilidad storage.js
        await saveMapping(fileName, posterUrl); 
        
        // Al ejecutar buildIndex() aquí, nos aseguramos de que el cambio sea persistente
        await buildIndex(); 
        
        res.json({ message: "Poster actualizado correctamente" });
    } catch (error) {
        logger.error(`❌ Error en fixMatch: ${error.message}`);
        res.status(500).json({ error: "No se pudo guardar la elección" });
    }
};
