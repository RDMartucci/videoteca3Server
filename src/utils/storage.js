//src/utils/storage.js
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Usamos el .env si existe, sino la raíz por defecto
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data.json');
const SETTINGS_PATH = path.join(process.cwd(), 'settings.json');

// --- GESTIÓN DE PÓSTERS (Tus Mappings) ---
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
export const getLibraryPaths = async () => {
    try {
        const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
        const config = JSON.parse(content);
        return config.paths || [];
    } catch (e) {
        // Si no hay settings.json, podrías devolver lo que esté en el .env como fallback
        return process.env.PATHS_TO_INDEX ? process.env.PATHS_TO_INDEX.split(',') : [];
    }
};

export const saveLibraryPaths = async (paths) => {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify({ paths }, null, 2));
};