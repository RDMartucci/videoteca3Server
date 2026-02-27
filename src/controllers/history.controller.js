// controllers/history.controller.js
//
// este controlador se encarga de manejar las rutas relacionadas con el historial de visualización de los usuarios. Permite guardar el progreso de visualización 
// y obtener la lista de contenido que el usuario ha estado viendo recientemente.
// Importamos las funciones del servicio de historial para interactuar con los datos de progreso de visualización.
// saveHistory: Esta función recibe una solicitud con el progreso de visualización en el cuerpo de la solicitud, lo guarda utilizando la función saveProgress 
// del servicio de historial y responde con un objeto JSON indicando que la operación fue exitosa.
// getHistory: Esta función obtiene la lista de contenido que el usuario ha estado viendo recientemente utilizando la función getContinueWatching del servicio de historial y responde con los datos en formato JSON. 

import { saveProgress, getContinueWatching } from '../services/history.service.js';

export const saveHistory = (req, res) => {
  saveProgress(req.body);
  res.json({ ok: true });
};

export const getHistory = (req, res) => {
  const data = getContinueWatching();
  res.json(data);
};
