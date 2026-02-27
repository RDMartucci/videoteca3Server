// src/controllers/stream.controller.js
//
// Controlador para manejar la transmisión de medios (streaming) a los clientes.
// Este controlador se encarga de leer el archivo de medios desde el sistema de archivos
// y enviarlo al cliente en partes (chunks) para permitir la reproducción continua.
// Importamos el módulo 'fs' para manejar el sistema de archivos y 'db' para acceder a la 
// base de datos.
// El método 'streamMedia' recibe la solicitud del cliente, obtiene el ID del medio a transmitir,
// verifica que el medio exista en la base de datos, y luego lee el archivo físico para enviarlo
// al cliente. Si el cliente solicita un rango específico del archivo (para reproducción continua),
// el controlador maneja esa solicitud y envía solo la parte solicitada.
//

import fs from "fs";
import db from "../db/database.js";

export const streamMedia = (req, res) => {
  const { id } = req.params;

  const media = db.prepare("SELECT * FROM media WHERE id = ?").get(id);
  if (!media) {
    return res.status(404).json({ error: "Media no encontrada" });
  }

  const filePath = media.path;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo físico no encontrado" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  }
};