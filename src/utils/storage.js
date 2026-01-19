//src/utils/storage.js
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Primero chequea el .env si existe, sino "C:/DatosVideoteca/data.json"
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'C:/DatosVideoteca/data.json');
const SETTINGS_PATH = path.join(process.cwd(), 'settings.json');

// --- GESTIÓN DE PÓSTERS  ---
export const saveMapping = async (fileName, tmdbData) => {
    const data = await getMappings();
    data[fileName] = tmdbData; 
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

export const getMappings = async () => {
    try {
        const content = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (e) { return {}; }
};

// --- GESTIÓN DE CONFIGURACIÓN (Rutas de carpetas) ---
// process.cwd() obtiene la ruta raíz de la app en CUALQUIER sistema operativo
const ROOT_DIR = process.cwd();

// const SETTINGS_PATH = path.join(ROOT_DIR, 'settings.json');
const DATA_PATH = path.join(ROOT_DIR, 'data.json');

export const getLibraryPaths = async () => {
    try {
        const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
        return JSON.parse(content).paths;
    } catch (e) {
        // Si no hay archivo, devolvemos las rutas del .env para no empezar de cero
        const envPaths = process.env.PATHS_TO_INDEX ? process.env.PATHS_TO_INDEX.split(',') : [];
        return envPaths;
    }
};

export const saveLibraryPaths = async (paths) => {
    // Al usar path.join, Node.js pone "/" en Linux/Android y "\" en Windows automáticamente
    await fs.writeFile(SETTINGS_PATH, JSON.stringify({ paths }, null, 2));
};