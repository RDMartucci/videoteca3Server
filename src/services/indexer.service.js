import fs from 'fs/promises';
import path from 'path';
import { PATHS_TO_INDEX, VIDEO_EXTENSIONS, TMDB_CONFIG } from '../config/constants.js';
import logger from '../config/logger.js';
import axios from 'axios';
import { cleanFileName } from '../utils/cleaner.js';
import { getMappings } from '../utils/storage.js';

let globalIndex = [];



async function getPoster(fileName) {
    // 1. ¿Ya lo elegimos manualmente antes?
    const savedData = await getMappings();
    if (savedData[fileName]) return savedData[fileName].poster;
    // 2. ¿Tenemos API Key de TMDB?
    if (!TMDB_CONFIG.apiKey) return null;
    
    try {
        const cleanName = cleanFileName(fileName);
        
        // Log para que veas en la consola si está limpiando o no
        logger.info(`🔎 TMDB Query: [${cleanName}] (Original: ${fileName})`);

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
        return null;
    }
    return null;
}

export const buildIndex = async () => {
    logger.info("🔍 Iniciando escaneo de medios...");
    const newIndex = [];

    for (const rootPath of PATHS_TO_INDEX) {
        try {
            const files = await fs.readdir(rootPath);
            
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (VIDEO_EXTENSIONS.includes(ext)) {
                    
                    // Llamamos a getPoster pasando el nombre sucio
                    const posterUrl = await getPoster(file);

                    newIndex.push({
                        name: file, // El nombre original para que se vea en la lista y VLC lo encuentre
                        path: path.join(rootPath, file),
                        category: path.basename(rootPath),
                        poster: posterUrl,
                        index: newIndex.length
                    });
                }
            }
        } catch (err) {
            logger.error(`Error en ruta ${rootPath}: ${err.message}`);
        }
    }
    globalIndex = newIndex;
    logger.info(`✅ Indexación lista: ${globalIndex.length} videos.`);
};

export const getIndex = () => globalIndex;