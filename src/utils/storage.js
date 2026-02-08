// //src/utils/storage.js
//
// Módulo para manejar el almacenamiento de mappings y configuraciones
// utilizando el sistema de archivos.
// Se unifican las rutas y se mejora la gestión de URLs completas.
//

import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// UNIFICACIÓN: Usamos una sola ruta consistente para los mappings (posters)
const DB_PATH = path.join(process.cwd(), 'data.json');
const SETTINGS_PATH = path.join(process.cwd(), 'settings.json');

export const getMappings = async () => {
    try {
        const content = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (e) { 
        return {}; 
    }
};

export const saveMapping = async (fileName, posterUrl) => {
    const data = await getMappings();
    // Guardamos directamente la URL completa para evitar problemas de reconstrucción
    data[fileName] = posterUrl; 
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

export const getLibraryPaths = async () => {
    try {
        const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        return parsed.paths || [];
    } catch (e) {
        return process.env.PATHS_TO_INDEX ? process.env.PATHS_TO_INDEX.split(',') : [];
    }
};

export const saveLibraryPaths = async (paths) => {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify({ paths }, null, 2));
};

