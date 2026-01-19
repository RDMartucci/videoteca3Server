import { getIndex } from '../services/indexer.service.js';
import { exec } from 'child_process';
import logger from '../config/logger.js';
import axios from 'axios';
import { TMDB_CONFIG } from '../config/constants.js';
import { saveMapping, getMappings } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';

const TMDB_TOKEN = process.env.TMDB_TOKEN;

export const getExplorerContent = (req, res) => {
    const { q } = req.query;
    let results = getIndex();

    if (q) {
        results = results.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));
    }
    res.json(results);
};

export const playMovie = (req, res) => {
    const { index } = req.body;
    const movie = getIndex().find(m => m.index === index);

    if (!movie) return res.status(404).json({ error: "Video no encontrado" });

    logger.info(`🎬 Ejecutando: ${movie.path}`);

    // Este comando es el más compatible con Windows para archivos con espacios
    const command = `start "" "${movie.path}"`;

    exec(command, (err) => {
        if (err) {
            logger.error(`❌ Falló al abrir: ${err.message}`);
            return res.status(500).json({ error: "No se pudo abrir el archivo" });
        }
    });

    res.json({ message: "Reproduciendo..." });
};

// Buscar candidatos para que el usuario elija

export const searchTMDBOptions = async (req, res) => {
    const { query } = req.query;
    console.log("📥 Servidor recibió query:", `"${query}"`);
    
    if (!query || query === "undefined" || query.trim() === "") {
        console.log("⚠️ Query vacío o inválido, abortando...");
        return res.json([]);
    }

    // const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=es-ES`;
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}` // Tu token seguro en el backend
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log("Respuesta de TMDB:", data);
        
        // Mapeamos los resultados para que el Modal los entienda
        const candidates = (data.results || []).slice(0, 9).map(item => ({
            id: item.id,
            title: item.title || item.name,
            year: (item.release_date || item.first_air_date || "").split('-')[0],
            poster: item.poster_path 
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                : 'https://via.placeholder.com/500x750?text=Sin+Imagen',
        }));
        
        res.json(candidates);
    } catch (error) {
        console.error("Error en búsqueda TMDB:", error);
        res.status(500).json([]);
    }
};

// export const searchTMDBOptions = async (req, res) => {
//     const { query } = req.query;
//     try {
//         const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/multi`, {
//             params: { api_key: TMDB_CONFIG.apiKey, 
//                     query:query, 
//                     language: 'es-ES' }
//         });
        
//         const candidates = response.data.results.slice(0, 6).map(item => ({
//             id: item.id,
//             title: item.title || item.name,
//             year: (item.release_date || item.first_air_date || "").split('-')[0],
//             poster: item.poster_path ? `${TMDB_CONFIG.imageBaseUrl}${item.poster_path}` : null,
//             type: item.media_type
//         }));
        
//         res.json(candidates);
//     } catch (error) {
//         console.error("Error en búsqueda TMDB:", error.message);
//         res.status(500).json([]);
//     }
// };

// Guardar la elección del usuario
export const fixMatch = async (req, res) => {
    const { fileName, posterUrl } = req.body;
    await saveMapping(fileName, { poster: posterUrl });
    await buildIndex(); // Refrescamos el índice para que tome el nuevo poster
    res.json({ message: "Poster actualizado correctamente" });
};
