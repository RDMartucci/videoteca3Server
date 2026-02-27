// src/utils/asyncHandler.js
//
// Middleware para manejar errores en funciones asíncronas de Express.
// Permite usar async/await en controladores sin necesidad de try/catch en cada uno.
//

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
            .catch(next);
  };
};
