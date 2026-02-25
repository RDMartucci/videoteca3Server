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
    req.user = decoded;
    next();
  } catch {
    const error = new Error("Token inválido");
    error.status = 401;
    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error("No tiene permisos");
      error.status = 403;
      return next(error);
    }
    next();
  };
};
