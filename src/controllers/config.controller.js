//./src/controllers/config.controller.js
//
// Controlador para la gestión de configuración, incluyendo el navegador de carpetas 
// y la gestión de rutas de la biblioteca.
// Este controlador maneja las solicitudes relacionadas con la configuración de la aplicación,
// como listar directorios para seleccionar rutas de la biblioteca y guardar esas rutas.
//
    
import { getLibraryPaths, saveLibraryPaths } from '../utils/storage.js';
import { buildIndex } from '../services/indexer.service.js';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

//navegador de carpetas.
export const listDirectories = async (req, res) => {
    try {
        let currentPath = req.query.path || "";
        let folders = [];

        // LÓGICA PARA LISTAR DISCOS (Si no hay path)
        if (currentPath === "" && process.platform === 'win32') {
            const { stdout } = await execPromise('wmic logicaldisk get name');
            folders = stdout.split('\r\r\n')
                .filter(line => line.includes(':'))
                .map(drive => ({
                    name: `Disco Local (${drive.trim()})`,
                    path: drive.trim() + '\\'
                }));
            
            return res.json({ currentPath: "Mi Equipo", parentPath: "", folders });
        }

        // LÓGICA PARA NAVEGAR CARPETAS
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        folders = entries
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('$'))
            .map(entry => ({
                name: entry.name,
                path: path.join(currentPath, entry.name)
            }));

        res.json({
            currentPath: path.resolve(currentPath),
            parentPath: path.dirname(currentPath) === currentPath ? "" : path.dirname(currentPath),
            folders
        });
    } catch (error) {
        res.status(500).json({ error: "No se pudo acceder a la carpeta" });
    }
};

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
        await saveLibraryPaths(paths);
        
        console.log("♻️ Configuración actualizada. Re-escaneando...");
        await buildIndex(); // Esto es lo que genera los logs en consola
        
        res.json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

