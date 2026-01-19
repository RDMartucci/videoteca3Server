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
export const searchTMDBOptions = async (req, res) => {
    const { query } = req.query;
    console.log("📥 Servidor recibió query:", `"${query}"`);
    
    if (!query || query === "undefined" || query.trim() === "") {
        return res.json([]);
    }

    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=es-ES`;
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

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
