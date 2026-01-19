import { getLibraryPaths, getMappings } from '../utils/storage.js';
import fs from 'fs/promises';

export const buildIndex = async () => {
    const paths = await getLibraryPaths(); // Obtiene rutas del settings.json
    const mappings = await getMappings();  // Obtiene tus pósters elegidos
    
    let fullLibrary = [];

    for (const folder of paths) {
        try {
            const files = await fs.readdir(folder);
            // ... lógica para filtrar videos y armar el objeto movie ...
            // Aquí haces el "merge":
            // if (mappings[fileName]) movie.poster = mappings[fileName].poster;
        } catch (err) {
            console.error(`Error escaneando ${folder}:`, err.message);
        }
    }
    return fullLibrary;
};