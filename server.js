// // // server.js
//
// Punto de entrada del servidor Videoteca
// Configura y arranca el servidor Express, maneja la indexación inicial y el watcher
//

import 'dotenv/config';
import app from './src/app.js';
import logger from './src/config/logger.js';
import { buildIndex } from './src/services/indexer.service.js';
import { startWatcher } from './src/services/watcher.service.js';

const PORT = process.env.PORT || 5000;

async function server() {
    try {
        logger.info("🚀 Iniciando Servidor Videoteca...");
        
        // 1. Intentar indexación (si falla porque no hay rutas, no detiene el servidor)
        try {
            await buildIndex();
            startWatcher();
        } catch (e) {
            logger.warn("⚠️ No se pudo indexar al inicio (posiblemente no hay rutas configuradas).");
        }

        // 2. Encender Express
        app.listen(PORT, () => {
            logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("❌ Error crítico al iniciar:", error);
        process.exit(1);
    }
}

server();

