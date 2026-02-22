// src/controllers/stream.controller.js
//
// Streaming profesional con soporte Range (HTML5 compatible)
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