// src/services/watcher.service.js
//
// Servicio que utiliza Chokidar para vigilar cambios en las rutas de películas
// y dispara el re-indexado cuando se detectan cambios.
// Requiere Chokidar para la vigilancia de archivos, el logger para registrar 
// eventos y el indexer para reconstruir el índice de películas.
//


import chokidar from 'chokidar';
import logger from '../config/logger.js';
import { buildIndex } from './indexer.service.js';
import { PATHS_TO_INDEX } from '../config/constants.js';

export const startWatcher = () => {
    if (!PATHS_TO_INDEX.length) return;

    // Chokidar vigila cambios en las rutas
    const watcher = chokidar.watch(PATHS_TO_INDEX, {
        ignored: /(^|[\/\\])\../, // ignora archivos ocultos
        persistent: true,
        ignoreInitial: true, // No hace nada al arrancar (ya lo hace el indexer)
        awaitWriteFinish: {
            stabilityThreshold: 3000, // Espera 3 seg a que termine de copiarse el archivo
            pollInterval: 100
        }
    });

    watcher
        .on('add', path => {
            logger.info(`🆕 Detectado nuevo archivo: ${path}`);
            buildIndex(); // Re-indexamos para incluir la nueva película
        })
        .on('unlink', path => {
            logger.info(`🗑️ Archivo eliminado: ${path}`);
            buildIndex();
        })
        .on('error', error => logger.error(`Error en Watcher: ${error}`));

    logger.info(`👀 Vigilancia activa en ${PATHS_TO_INDEX.length} carpetas.`);
};