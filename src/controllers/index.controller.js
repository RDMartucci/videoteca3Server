// controllers/index.controller.js
// Este controlador se encarga de manejar la ruta para ejecutar la indexación de la librería de contenido. Permite construir el índice de búsqueda utilizando la función buildIndex del servicio de indexación.
// runIndex: Esta función es un controlador asíncrono que intenta ejecutar la función buildIndex para construir el índice de búsqueda. Si la operación es exitosa, responde con un objeto JSON indicando que la indexación se completó. Si ocurre un error durante el proceso, captura el error, lo registra en la consola y responde con un mensaje de error en formato JSON.
// Importamos la función buildIndex del servicio de indexación para interactuar con el proceso de construcción del índice de búsqueda.
//


import { buildIndex } from '../services/indexer.service.js';

export const runIndex = async (req, res) => {
  try {
    await buildIndex();
    res.json({ ok: true, message: "Indexación completada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error indexando librería" });
  }
};