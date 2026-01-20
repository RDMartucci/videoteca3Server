import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const browseFolder = async (req, res) => {
    try {
        const folderPath = req.body.path || os.homedir(); // Si no hay ruta, empezamos en el Home
        const items = await fs.readdir(folderPath, { withFileTypes: true });

        const folders = items
            .filter(item => item.isDirectory())
            .map(item => ({
                name: item.name,
                path: path.join(folderPath, item.name)
            }));

        res.json({
            currentPath: folderPath,
            parentPath: path.dirname(folderPath),
            folders: folders
        });
    } catch (error) {
        res.status(500).json({ error: "No se pudo acceder a la carpeta" });
    }
};