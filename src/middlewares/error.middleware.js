// src/middlewares/error.middleware.js
//
// Middleware de manejo de errores para capturar y responder a errores en la aplicación.
// Este middleware debe ser registrado después de todas las rutas y otros middlewares.
//

export const errorHandler = (err, req, res, next) => {

  console.error("🔥 ERROR:", err.message);

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Error interno del servidor"
  });
};



// export const errorHandler = (err, req, res, next) => {
//   console.error("🔥 ERROR:", err);

//   const status = err.status || 500;

//   res.status(status).json({
//     success: false,
//     message: err.message || "Error interno del servidor"
//   });
// };
