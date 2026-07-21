//./src/controllers/config.controller.js
//
// Controlador para la gestión de configuración, incluyendo el navegador de carpetas 
// y la gestión de rutas de la biblioteca.
// Este controlador maneja las solicitudes relacionadas con la configuración de la aplicación,
// como listar directorios para seleccionar rutas de la biblioteca y guardar esas rutas.
//
    
import { getLibraryPaths, saveLibraryPaths } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';

// --- GESTIÓN DE CONFIGURACIÓN DE RUTAS DE LA BIBLIOTECA ---
// Obtener las rutas de la biblioteca.
export const getSettings = async (req, res) => {
    try {
        const paths = await getLibraryPaths();
        res.json({ paths });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener configuración" });
    }
};

// Guardar las rutas de la biblioteca y re-escanear.
export const saveSettings = async (req, res) => {
    try {
        const { paths } = req.body;
        if (!Array.isArray(paths) || !paths.every(item => typeof item === 'string')) {
            return res.status(400).json({ error: 'paths debe ser un arreglo de rutas' });
        }

        await saveLibraryPaths(paths);
        
        console.log("♻️ Configuración actualizada. Re-escaneando...");
        await buildIndex(); // Esto es lo que genera los logs en consola
        
        res.json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

