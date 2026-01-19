import 'dotenv/config';
import app from './src/app.js';
import logger from './src/config/logger.js';
import { buildIndex } from './src/services/indexer.service.js';
import { startWatcher } from './src/services/watcher.service.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        logger.info("🚀 Iniciando Servidor Videoteca...");
        
        // 1. Indexación inicial
        await buildIndex();
        
        // 2. Iniciar vigilancia de archivos
        startWatcher();

        // 3. Encender Express
        app.listen(PORT, () => {
            logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error("❌ Error crítico al iniciar:", error);
        process.exit(1);
    }
}

bootstrap();