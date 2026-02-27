// controllers/auth.controller.js
//
// Controlador para manejar las rutas de autenticación (registro y login).
// Este controlador se encarga de recibir las solicitudes, validar los datos y 
// llamar a los servicios correspondientes.
//

import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser, loginUser } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {

  const { username, password, role } = req.body;

  if (!username || !password) {
    const error = new Error("username y password son requeridos");
    error.status = 400;
    throw error;
  }

  const user = await registerUser({ username, password, role });

  res.status(201).json({
    success: true,
    user
  });
});

export const login = asyncHandler(async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    const error = new Error("username y password son requeridos");
    error.status = 400;
    throw error;
  }

  const result = await loginUser({ username, password });

  res.json({
    success: true,
    token: result.token
  });
});
