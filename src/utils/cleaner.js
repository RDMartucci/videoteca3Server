// src/utils/cleaner.js
/**
 * Limpia el nombre de un archivo para mejorar la búsqueda en TMDB
 */
export const cleanFileName = (fileName) => {
    if (!fileName) return "";

    let name = fileName;

    // 1. Quitar la extensión (ej: .mkv, .mp4)
    name = name.replace(/\.[^/.]+$/, "");

    // 2. Reemplazar puntos, guiones y guiones bajos por espacios
    name = name.replace(/[._-]/g, ' ');

    // 3. Quitar términos técnicos comunes (Case Insensitive)
    const patterns = [
        /\b\d{4}\b/g, // años
        /\b(h264|x264|h265|x265|hevc)\b/gi,
        /\b(1080p|720p|4k|2160p|uhd|bluray|brrip|webrip|web-dl|dvdrip)\b/gi,
        /\b(ac3|dts|aac|mp3|dual|latino|castellano|multi)\b/gi,
        /\b(yts|yify|rarbg|ettv)\b/gi,
        /[\[\]()]/g, // Quita corchetes y paréntesis
    ];

    patterns.forEach(pattern => {
        name = name.replace(pattern, '');
    });

    // 4. Limpiar espacios extra
    return name.trim();
};