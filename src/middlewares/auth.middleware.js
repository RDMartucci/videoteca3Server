// auth.middleware.js

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export const protect = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("No autorizado");
    error.status = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔥 Esto es clave
    req.user = decoded;

    next();
  } catch (err) {
    const error = new Error("Token inválido");
    error.status = 401;
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      const error = new Error("No autenticado");
      error.status = 401;
      return next(error);
    }

    // Soporta authorize('admin') o authorize(['admin'])
    if (Array.isArray(allowedRoles[0])) {
      allowedRoles = allowedRoles[0];
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("No tiene permisos suficientes");
      error.status = 403;
      return next(error);
    }

    next();
  };
};

