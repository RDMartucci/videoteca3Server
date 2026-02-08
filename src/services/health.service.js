// src/services/health.service.js
//
// Servicio para verificar el estado físico de las rutas configuradas
// en PATHS_TO_INDEX.
// Utiliza fs.readdir para comprobar la accesibilidad de cada ruta.
// Retorna un objeto con el estado general y detalles por ruta.
//

import fs from 'fs/promises';
import { PATHS_TO_INDEX } from '../config/constants.js';
import logger from '../config/logger.js';

/**
 * Verifica el estado físico de cada ruta configurada
 */
export const getSystemStatus = async () => {
    const driveStatus = await Promise.all(
        PATHS_TO_INDEX.map(async (folderPath) => {
            try {
                // readdir es más fiable para discos externos que access
                await fs.readdir(folderPath); 
                return { path: folderPath, status: "ONLINE" };
            } catch (error) {
                return { path: folderPath, status: "OFFLINE" };
            }
        })
    );

    const onlineCount = driveStatus.filter(d => d.status === "ONLINE").length;
    return {
        status: onlineCount === driveStatus.length ? "OK" : "WARNING",
        drives_online: onlineCount,
        total_drives: driveStatus.length,
        details: driveStatus
    };
};

