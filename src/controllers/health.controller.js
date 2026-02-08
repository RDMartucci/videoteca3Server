// src/controllers/health.controller.js
//
// Controlador para el endpoint de salud del sistema.
//
// Verifica el estado de las rutas de almacenamiento definidas en settings.json
// y devuelve un resumen del estado de las mismas.
// Si no hay rutas definidas, devuelve un estado 'EMPTY'.
// Si al menos una ruta está accesible, devuelve un estado 'OK'.
// Si ninguna ruta está accesible, devuelve un estado 'EMPTY'.
// En caso de error, devuelve un estado 'ERROR'.
//
/******************************************************************************************** */

import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.resolve('settings.json');

export const getHealth = async (req, res) => {
    try {
        let paths = [];
        try {
            const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
            const settings = JSON.parse(content);
            paths = settings.paths || [];
        } catch {
            paths = [];
        }

        const details = await Promise.all(paths.map(async (p) => {
            try {
                await fs.access(p);
                return { path: p, online: true };
            } catch {
                return { path: p, online: false };
            }
        }));

        const drives_online = details.filter(d => d.online).length;

        res.json({
            status: drives_online > 0 ? 'OK' : 'EMPTY',
            drives_online,
            total_drives: paths.length,
            details
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', drives_online: 0, total_drives: 0, details: [] });
    }
};

// import fs from 'fs/promises';
// import { getLibraryPaths } from '../utils/storage.js';

// export const getStatus = async (req, res) => {
//     try {
//         const paths = await getLibraryPaths();
        
//         if (paths.length === 0) {
//             return res.json({
//                 status: 'EMPTY',
//                 drives_online: 0,
//                 total_drives: 0,
//                 details: []
//             });
//         }

//         // Verificamos cada ruta en paralelo
//         const checks = await Promise.all(paths.map(async (folder) => {
//             try {
//                 await fs.access(folder);
//                 return { path: folder, online: true };
//             } catch {
//                 return { path: folder, online: false };
//             }
//         }));

//         const onlineCount = checks.filter(c => c.online).length;

//         res.json({
//             status: onlineCount === paths.length ? 'OK' : 'WARNING',
//             drives_online: onlineCount,
//             total_drives: paths.length,
//             details: checks // Enviamos detalles por si quieres mostrarlos al pasar el mouse
//         });
//     } catch (error) {
//         res.status(500).json({ status: 'ERROR', drives_online: 0, total_drives: 0 });
//     }
// };

