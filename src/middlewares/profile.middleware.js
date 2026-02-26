import db from '../db/database.js';

export const attachProfile = (req, res, next) => {

  const profileId = req.headers['x-profile-id'];

  if (!profileId) {
    const error = new Error("X-Profile-ID header requerido");
    error.status = 400;
    return next(error);
  }

  // Verificar que el perfil pertenece al usuario autenticado
  const profile = db.prepare(`
    SELECT * FROM profiles
    WHERE id = ? AND userId = ?
  `).get(profileId, req.user.id);

  if (!profile) {
    const error = new Error("Perfil inválido o no pertenece al usuario");
    error.status = 403;
    return next(error);
  }

  req.profile = profile;

  next();
};
