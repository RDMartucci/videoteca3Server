import fs from 'fs/promises';
import path from 'path';
import { TMDB_CONFIG } from '../config/constants.js';
import logger from '../config/logger.js';
import axios from 'axios';
import { cleanFileName } from '../utils/cleaner.js';
import { getLibraryPaths, getMappings } from '../utils/storage.js';
/**
 * Busca el póster siguiendo la jerarquía: Manual (mappings) > Automático (TMDB)
 */
async function getPoster(fileName, mappings) {
    // 1. Prioridad: ¿Ya lo elegimos manualmente? (Ya viene cargado en mappings)
    if (mappings[fileName]) {
        return mappings[fileName].poster || mappings[fileName]; 
    }

    // 2. ¿Tenemos API Key para intentar búsqueda automática?
    if (!TMDB_CONFIG.apiKey) return null;
    
    try {
        const cleanName = cleanFileName(fileName);
        logger.info(`🔎 Búsqueda automática TMDB: [${cleanName}]`);

        const response = await axios.get(`${TMDB_CONFIG.baseUrl}/search/movie`, {
            params: { 
                api_key: TMDB_CONFIG.apiKey, 
                query: cleanName, 
                language: 'es-ES' 
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const posterPath = response.data.results[0].poster_path;
            return posterPath ? `${TMDB_CONFIG.imageBaseUrl}${posterPath}` : null;
        }
    } catch (err) {
        logger.error(`❌ Error automático TMDB para ${fileName}: ${err.message}`);
        return null;
    }
    return null;
}

export const buildIndex = async () => {
    try {
        const paths = await getLibraryPaths();
        const mappings = await getMappings(); // Cargamos data.json una sola vez
        let allMovies = [];
        let idCounter = 0;

        if (!paths || paths.length === 0) return [];

        for (const folder of paths) {
            try {
                // Verificar acceso a la carpeta
                await fs.access(folder);
                const files = await fs.readdir(folder);

                // Procesamos archivos en paralelo para mayor velocidad
                const moviePromises = files.map(async (file) => {
                    if (file.match(/\.(mp4|mkv|avi|mov)$/i)) {
                        // Llamamos a getPoster pasando los mappings ya cargados
                        const poster = await getPoster(file, mappings);

                        return {
                            index: 0, // Se reasignará después para mantener orden
                            name: file,
                            path: path.join(folder, file),
                            poster: poster,
                            category: path.basename(folder)
                        };
                    }
                    return null;
                });

                const results = await Promise.all(moviePromises);
                allMovies.push(...results.filter(m => m !== null));

            } catch (e) {
                logger.error(`⚠️ Omitiendo ruta inaccesible: ${folder}`);
            }
        }

        // Asignamos índices únicos finales
        return allMovies.map((movie, i) => ({ ...movie, index: i }));

    } catch (error) {
        logger.error("❌ Error crítico en indexer service:", error);
        return [];
    }
};

// Mantenemos getIndex para compatibilidad con otros controladores
export const getIndex = async () => await buildIndex();

