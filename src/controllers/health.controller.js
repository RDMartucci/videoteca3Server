import { getSystemStatus } from '../services/health.service.js';

import fs from 'fs/promises';
import { getLibraryPaths } from '../utils/storage.js';

export const getStatus = async (req, res) => {
    try {
        const paths = await getLibraryPaths();
        
        if (paths.length === 0) {
            return res.json({
                status: 'EMPTY',
                drives_online: 0,
                total_drives: 0,
                details: []
            });
        }

        // Verificamos cada ruta en paralelo
        const checks = await Promise.all(paths.map(async (folder) => {
            try {
                await fs.access(folder);
                return { path: folder, online: true };
            } catch {
                return { path: folder, online: false };
            }
        }));

        const onlineCount = checks.filter(c => c.online).length;

        res.json({
            status: onlineCount === paths.length ? 'OK' : 'WARNING',
            drives_online: onlineCount,
            total_drives: paths.length,
            details: checks // Enviamos detalles por si quieres mostrarlos al pasar el mouse
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', drives_online: 0, total_drives: 0 });
    }
};

