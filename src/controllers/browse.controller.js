// src/controllers/browse.controller.js
import { exec } from 'child_process';
import logger from '../config/logger.js';
import { saveMapping, getMappings } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_PATH = path.resolve('settings.json');

// Cargamos el Token desde las variables de entorno
const TMDB_TOKEN = process.env.TMDB_TOKEN;

// Leer configuración.
export const getSettings = async (req, res) => {
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        const settings = JSON.parse(data);
        // Si el archivo existe pero la lista de rutas está vacía
        res.json({ ...settings, isFirstStart: settings.paths.length === 0 });
    } catch (error) {
        // Si el archivo ni siquiera existe, es el primer inicio absoluto
        res.json({ paths: [], isFirstStart: true });
    }
};

// export const getSettings = async (req, res) => {
//     try {
//         const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
//         res.json(JSON.parse(data));
//     } catch (error) {
//         // Si el archivo no existe, enviamos una estructura vacía
//         res.json({ paths: [] });
//     }
// };

// Guardar configuración.
export const saveSettings = async (req, res) => {
    try {
        const { paths } = req.body;
        
        // Guardar las rutas
        await fs.writeFile(SETTINGS_FILE, JSON.stringify({ paths }, null, 2));
        
        // Iniciar el escaneo inmediatamente
        // Si buildIndex es asíncrono, el 'await' hará que el spinner en el front
        // se mantenga activo hasta que termine de procesar las carpetas.
        await buildIndex(); 

        res.json({ message: "Configuración actualizada y escaneo completado" });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
};


// export const saveSettings = async (req, res) => {
//     try {
//         const { paths } = req.body;
//         await fs.writeFile(SETTINGS_PATH, JSON.stringify({ paths }, null, 2));
//         res.json({ message: "Configuración guardada correctamente" });
//     } catch (error) {
//         res.status(500).json({ error: "Error al guardar configuración" });
//     }
// };

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

/*
 Busca candidatos en TMDB (Multi-search: Películas y Series)
 Obtiene detalles profundos de una película/serie por ID de TMDB
 */

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
