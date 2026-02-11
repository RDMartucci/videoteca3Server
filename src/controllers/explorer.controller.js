// controllers/explorer.controller.js
//
// Este controlador maneja la lógica para explorar carpetas y listar su contenido, 
//  así como para listar las unidades de disco en Windows.
//
/***************************************************************************************** */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nodeDiskInfo from 'node-disk-info';
import logger from '../config/logger.js';

// Definimos rutas comunes según el sistema operativo
const homeDir = os.homedir();
const quickAccess = [
    { name: 'Inicio', path: homeDir, icon: 'Home' },
    { name: 'Videos', path: path.join(homeDir, 'Videos'), icon: 'Film' },
    { name: 'Descargas', path: path.join(homeDir, 'Downloads'), icon: 'Download' },
    { name: 'Escritorio', path: path.join(homeDir, 'Desktop'), icon: 'Monitor' }
];

export const exploreFolder = async (req, res) => {
    try {// Detectamos si el sistema operativo es Windows para manejar la raíz de manera diferente.
        console.log("Explorando carpeta:", req.body.path); // Log para depuración.

        const isWindows = os.platform() === 'win32';// Obtenemos la ruta de la carpeta desde el cuerpo de la solicitud. Si no se proporciona, será undefined.
        let folderPath = req.body.path;// Inicializamos un array para las unidades de disco, que solo se llenará si estamos en Windows y no se proporciona una ruta específica.
        let disks = [];

        // 1. Manejo de la Raíz (Cuando no hay path o se pide 'root')
        if (!folderPath || folderPath === 'root') {// Si no se proporciona una ruta o se solicita 'root', manej
            if (isWindows) {
                // En Windows, listamos las unidades de disco
                const diskEntries = nodeDiskInfo.getDiskInfoSync();// Mapear la información de los discos a un formato más simple para el frontend
                disks = diskEntries.map(d => ({ 
                    name: d.mounted, 
                    path: d.mounted 
                }));

                return res.json({
                    currentPath: 'root',
                    parentPath: 'root',
                    folders: [],
                    disks: disks,
                    quickAccess: quickAccess
                });
                logger.info("Discos encontrados:", disks); // Log para depuración.
                console.log("Discos encontrados:", disks); // Log para depuración.

            } else {
                // En Linux/Unix, si no hay path, empezamos en /
                folderPath = '/';
            }
        }

        // 2. Lectura del directorio físico
        // Verificamos acceso antes de intentar leer
        await fs.access(folderPath);
        const items = await fs.readdir(folderPath, { withFileTypes: true });

        const folders = items
            .filter(item => item.isDirectory())
            .map(item => ({
                name: item.name,
                path: path.join(folderPath, item.name)
            }))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            console.log(`Carpetas encontradas en ${folderPath}:`, folders.map(f => f.name)); // Log para depuración.

        // 3. Respuesta final unificada
        // path.dirname(folderPath) === folderPath detecta raíz en cualquier plataforma (/, C:\, \\server\share, etc.)
        const isRoot = path.dirname(folderPath) === folderPath;
        res.json({
            currentPath: folderPath,
            parentPath: isRoot ? 'root' : path.dirname(folderPath),
            folders: folders,
            disks: [], // No enviamos discos si ya estamos dentro de una carpeta
            quickAccess: quickAccess
        });

    } catch (error) {// Si ocurre un error (como acceso denegado o ruta inexistente), lo registramos y respondemos con un error 500.
        console.error("Error en explorer:", error.message);// Log del error para diagnóstico.
        logger.error("Error al explorar carpeta:", error);// Registramos el error para diagnóstico.
        // Respondemos con un error 500 y un mensaje de error detallado para ayudar en la depuración.
        res.status(500).json({ 
            error: "Acceso denegado o ruta inexistente",
            details: error.message 
        });
    }
};


// import fs from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import nodeDiskInfo from 'node-disk-info';

// // Definimos rutas comunes según el sistema operativo
// const homeDir = os.homedir();
// const quickAccess = [
//     { name: 'Inicio', path: homeDir, icon: 'Home' },
//     { name: 'Videos', path: path.join(homeDir, 'Videos'), icon: 'Film' },
//     { name: 'Descargas', path: path.join(homeDir, 'Downloads'), icon: 'Download' },
//     { name: 'Escritorio', path: path.join(homeDir, 'Desktop'), icon: 'Monitor' }
// ];

// export const exploreFolder = async (req, res) => {
//     try {
//         const isWindows = os.platform() === 'win32';
//         let folderPath = req.body.path;

//         // Si no hay ruta y es Windows, devolvemos los Discos (C:, D:)
//         if (!folderPath && isWindows) {
//             const disks = nodeDiskInfo.getDiskInfoSync();
//             return res.json({
//                 currentPath: 'root',
//                 disks: disks.map(d => ({ name: d.mounted, path: d.mounted })),
//                 folders: []
//             });
//         }

//         // Si no hay ruta y es Linux/Unix, empezamos en /
//         if (!folderPath) folderPath = isWindows ? os.homedir() : '/';

//         const items = await fs.readdir(folderPath, { withFileTypes: true });

//         const folders = items
//             .filter(item => item.isDirectory())
//             .map(item => ({
//                 name: item.name,
//                 path: path.join(folderPath, item.name)
//             }))
//             .sort((a, b) => a.name.localeCompare(b.name));

//         // Al enviar la respuesta al frontend, añadimos este array:
//         res.json({
//             currentPath: folderPath,
//             parentPath: path.dirname(folderPath),
//             folders: folders,
//             disks: disks || [],
//             quickAccess: quickAccess // <-- Nueva propiedad
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Acceso denegado o ruta inexistente" });
//     }
// };