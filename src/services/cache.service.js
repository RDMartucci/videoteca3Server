// src/services/cache.service.js
// Servicio de caché para almacenar temporalmente los datos de la biblioteca.
// Este servicio utiliza una variable en memoria para almacenar los datos y un 
// timestamp para controlar la validez de la caché.
// La función getCache devuelve los datos almacenados si la caché es válida,
// o null si la caché ha expirado o no existe. La función setCache se utiliza
// para almacenar nuevos datos en la caché, y invalidateCache se puede llamar
// para invalidar manualmente la caché.
// Nota: Este servicio es simple y no persistente, por lo que los datos se perderán
// si el servidor se reinicia. Para una solución más robusta, se podría considerar
// el uso de una base de datos o un sistema de caché como Redis.
//

let libraryCache = null;
let cacheTimestamp = null;
const TTL = 1000 * 60 * 5; // 5 minutos

export const getCache = () => {
  if (!libraryCache) return null;
  if (Date.now() - cacheTimestamp > TTL) {
    libraryCache = null;
    return null;
  }
  return libraryCache;
};

export const setCache = (data) => {
  libraryCache = data;
  cacheTimestamp = Date.now();
};

export const invalidateCache = () => {
  libraryCache = null;
};
