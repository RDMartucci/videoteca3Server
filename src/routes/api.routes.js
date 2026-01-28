// src/routes/api.routes.js
import express from 'express';
const router = express.Router();
import * as browseController from '../controllers/browse.controller.js';
import { getHealth } from '../controllers/health.controller.js'; 

// Ruta para obtener la configuración actual.
router.get('/settings', browseController.getSettings);
// Ruta para guardar la configuración enviada desde el frontend.
router.post('/settings', browseController.saveSettings);
// Ruta para verificar el estado de salud del servidor.
router.get('/health', getHealth);
// Ruta para reproducir una película específica.
router.post('/play', browseController.playMovie);
// Ruta para corregir el mapeo manual de una película.
router.post('/fix-match', browseController.fixMatch);
// Ruta para buscar opciones en TMDB basadas en un título proporcionado.
router.get('/search-tmdb', browseController.searchTMDBOptions);
// POST /api/explorer/browse lo maneja explorer.routes.js (browseFolder); aquí solo biblioteca/scan.
router.get('/movie-details', browseController.getMovieDetails);
// Ruta para explorar el contenido de una carpeta específica.
router.get('/browse', browseController.getExplorerContent);
// Ruta para escanear las carpetas de la biblioteca.
router.post('/scan', async (req, res) => {
    try {
        await browseController.getExplorerContent(req, res);
    } catch (error) { 
        res.status(500).json({ error: "Error durante el escaneo" });
    }
});

export default router;

/*************************************************************************************** */
// import express from 'express';
// const router = express.Router();
// import * as browseController from '../controllers/browse.controller.js';
// // Importamos el controlador de salud (asegúrate de tenerlo o créalo)
// import { getHealth } from '../controllers/health.controller.js'; 

// // Rutas de configuración y escaneo
// router.get('/settings', browseController.getSettings);
// router.post('/settings', browseController.saveSettings);

// // ESTA ES LA RUTA QUE TE DA EL ERROR 404
// router.post('/scan', async (req, res) => {
//     try {
//         await browseController.getExplorerContent(req, res);
//     } catch (error) {
//         res.status(500).json({ error: "Error durante el escaneo" });
//     }
// });

// // Rutas de datos
// router.get('/browse', browseController.getExplorerContent);
// router.get('/health', getHealth); // Para que el tooltip no esté vacío
// router.post('/play', browseController.playMovie);
// router.get('/search-tmdb', browseController.searchTMDBOptions);
// router.post('/fix-match', browseController.fixMatch);
// router.get('/movie-details', async (req, res) => {
//     try {
//         const title = req.query.id; // Recibe "Alien Romulus"
//         // Aquí deberías llamar a una función que busque en TMDB 
//         // o devolver los datos que ya tengas.
//         const details = await browseController.searchTMDBOptions(title); 
//         res.json(details[0] || {}); // Devolvemos el primer resultado
//     } catch (error) {
//         res.status(500).json({ error: "Error al obtener detalles" });
//     }
// });

// export default router;