// src/config/constants.js
/**************************************************************************************************
 * Archivo de configuración de constantes globales para la aplicación.
 * 
 * Define rutas, extensiones de archivos de video soportados, y configuración de la API de TMDB.
 *************************************************************************************************/

import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Si el .env tiene una ruta, la usamos; si no, usamos la raíz por defecto
export const DATA_JSON_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data.json');

export const PATHS_TO_INDEX = process.env.PATHS_TO_INDEX 
    ? process.env.PATHS_TO_INDEX.split(',') 
    : [];

export const VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.avi', '.mov',
    '.wmv', '.flv', '.webm', '.mpg', 
    '.mpeg', '.m4v', '.3gp'];

export const TMDB_CONFIG = {
    apiKey: process.env.TMDB_API_KEY,
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500'
};

// Alias para compatibilidad
export const BASE_FOLDERS = PATHS_TO_INDEX;

