// src/services/scanner.service.js
//
// Servicio encargado de escanear las carpetas configuradas por el usuario y 
// construir un índice de películas disponibles, incluyendo la gestión de pósters manuales.
// Utiliza las utilidades de almacenamiento para obtener las rutas y los mapeos de pósters.
// Retorna un array de objetos con la información de cada película.
// Cada objeto contiene: index, name, path, poster (si existe), category.
// Maneja errores de acceso a carpetas y archivos de manera robusta.
// Usa fs/promises para operaciones asíncronas con el sistema de archivos.
//

import fs from 'fs/promises';
import path from 'path';
import { getLibraryPaths, getMappings } from '../utils/storage.js';

export const buildIndex = async () => {
    try {
        // 1. Obtenemos las rutas que el usuario guardó en el modal
        const paths = await getLibraryPaths(); 
        // 2. Obtenemos los pósters que el usuario ya corrigió
        const mappings = await getMappings();
        
        console.log("📂 Iniciando escaneo en rutas:", paths);

        let allMovies = [];
        let globalIndex = 0;

        // Si no hay rutas, devolvemos vacío de inmediato
        if (!paths || paths.length === 0) {
            console.log("⚠️ No hay rutas configuradas en settings.json");
            return [];
        }

        for (const folder of paths) {
            try {
                // Verificamos si la carpeta existe antes de leer
                await fs.access(folder);
                const files = await fs.readdir(folder);
                
                // Filtramos solo archivos de video
                const videoFiles = files.filter(file => 
                    file.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)
                );

                for (const file of videoFiles) {
                    allMovies.push({
                        index: globalIndex++,
                        name: file,
                        path: path.join(folder, file),
                        // Si existe un póster manual en data.json, lo usamos
                        poster: mappings[file] ? mappings[file] : null,
                        category: path.basename(folder)
                    });
                }
            } catch (err) {
                console.error(`❌ Error al acceder a la carpeta ${folder}:`, err.message);
                // Si una carpeta falla (ej: disco desconectado), seguimos con la siguiente
                continue; 
            }
        }

        console.log(`✅ Escaneo finalizado. Total títulos: ${allMovies.length}`);
        return allMovies;

    } catch (error) {
        console.error("❌ Error crítico en buildIndex:", error);
        return [];
    }
};
