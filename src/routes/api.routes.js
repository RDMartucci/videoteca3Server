import { Router } from 'express';
// Agrupamos las importaciones por controlador para mayor claridad
import { 
    getExplorerContent, 
    playMovie, 
    searchTMDBOptions, 
    fixMatch 
} from '../controllers/browse.controller.js';

import { getStatus } from '../controllers/health.controller.js';
import { listDirectories, getSettings, saveSettings } from '../controllers/config.controller.js';

const router = Router();

// --- RUTAS DE NAVEGACIÓN Y VIDEOS ---
/**
 * GET /api/browse
 * Obtiene la lista de películas escaneando dinámicamente las carpetas en settings.json
 */
router.get('/browse', getExplorerContent);

/**
 * POST /api/play
 * Abre el archivo de video en el reproductor del sistema (usa el index para buscar el path)
 */
router.post('/play', playMovie);


// --- RUTAS DE METADATOS (TMDB) ---
/**
 * GET /api/search-tmdb
 * Consulta la API de TMDB para mostrar opciones al usuario en el modal de corrección
 */
router.get('/search-tmdb', searchTMDBOptions);

/**
 * POST /api/fix-match
 * Guarda el poster elegido por el usuario en data.json para persistencia manual
 */
router.post('/fix-match', fixMatch);


// --- RUTAS DE SISTEMA Y CONFIGURACIÓN ---
/**
 * GET /api/health
 * Verifica si las rutas configuradas están online (accesibles) para el indicador del Navbar
 */
router.get('/health', getStatus);

/**
 * GET /api/settings
 * Devuelve el array de rutas actuales guardadas en settings.json
 */
router.get('/settings', getSettings);

/**
 * POST /api/settings
 * Guarda nuevas rutas de carpetas y dispara un re-escaneo automático
 */
router.post('/settings', saveSettings);

//Ruta para listar directorios (opcional).
router.get('/config/list-dir', listDirectories);

export default router;