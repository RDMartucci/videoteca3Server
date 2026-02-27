// src/validators/history.validator.js
//
// Esquema de validación para el historial de reproducción de películas.
// Define los campos necesarios para registrar el progreso de una película,
// incluyendo el ID de la película, el progreso actual y la duración total.
// Este esquema se utiliza para validar las solicitudes que actualizan el historial
// de reproducción, asegurando que los datos sean correctos antes de almacenarlos.
// Requiere el módulo de validación para definir las reglas de validación.
//


export const historySchema = {
  mediaId: {
    required: true,
    type: "string"
  },
  progress: {
    required: true,
    type: "number",
    min: 0
  },
  duration: {
    required: true,
    type: "number",
    min: 1
  }
};
