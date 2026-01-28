// import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nodeDiskInfo from 'node-disk-info';

// Definimos rutas comunes según el sistema operativo
const homeDir = os.homedir();
const quickAccess = [
    { name: 'Inicio', path: homeDir, icon: 'Home' },
    { name: 'Videos', path: path.join(homeDir, 'Videos'), icon: 'Film' },
    { name: 'Descargas', path: path.join(homeDir, 'Downloads'), icon: 'Download' },
    { name: 'Escritorio', path: path.join(homeDir, 'Desktop'), icon: 'Monitor' }
];

export const browseFolder = async (req, res) => {
    try {
        const isWindows = os.platform() === 'win32';
        let folderPath = req.body.path;
        let disks = [];

        // 1. Manejo de la Raíz (Cuando no hay path o se pide 'root')
        if (!folderPath || folderPath === 'root') {
            if (isWindows) {
                // En Windows, listamos las unidades de disco
                const diskEntries = nodeDiskInfo.getDiskInfoSync();
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

    } catch (error) {
        console.error("Error en explorer:", error.message);
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

// export const browseFolder = async (req, res) => {
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