import { Router } from 'express';
import { getExplorerContent, playMovie } from '../controllers/browse.controller.js';
import { getStatus } from '../controllers/health.controller.js';
import { searchTMDBOptions, fixMatch } from '../controllers/browse.controller.js';

const router = Router();


// --- RUTAS DE NAVEGACIÓN Y VIDEOS ---
// Obtener todas las películas (con búsqueda opcional ?q=...)
router.get('/browse', getExplorerContent);

// Ejecutar reproducción en VLC (recibe { index })
router.post('/play', playMovie);

// --- RUTAS DE METADATOS (TMDB) ---
// Buscar candidatos en TMDB para elegir un póster manualmente
router.get('/search-tmdb', searchTMDBOptions);

// Guardar la elección manual del usuario y actualizar data.json
router.post('/fix-match', fixMatch);

// --- RUTAS DE SISTEMA ---
// Estado de los discos y carpetas (lo que usa el Navbar)
router.get('/health', getStatus);

export default router;