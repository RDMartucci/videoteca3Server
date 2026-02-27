// services/profile.service.js
//
// Este servicio maneja la lógica de negocio relacionada con los perfiles de usuario.
// Aquí se implementan funciones para crear, obtener y eliminar perfiles.
// Cada función interactúa con la base de datos a través de consultas SQL preparadas.
// La función createProfile recibe los datos necesarios para crear un nuevo perfil, 
// genera un ID único y lo inserta en la base de datos.
// La función getProfilesByUser obtiene todos los perfiles asociados a un usuario específico.
// La función deleteProfile elimina un perfil específico, asegurándose de que el perfil 
// pertenezca al usuario que realiza la solicitud.
// Importamos la instancia de la base de datos y la función para generar IDs únicos.
//

import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createProfile = ({ userId, name, avatar, isChild }) => {

  const id = uuidv4();

  db.prepare(`
    INSERT INTO profiles (id, userId, name, avatar, isChild, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    name,
    avatar || null,
    isChild ? 1 : 0,
    new Date().toISOString()
  );

  return { id, name, avatar, isChild };
};

// export const createProfile = ({ userId, name, avatar, isChild }) => {

//   const id = uuidv4();

//   db.prepare(`
//     INSERT INTO profiles (id, userId, name, avatar, isChild, createdAt)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `).run(
//     id,
//     userId,
//     name,
//     avatar || null,
//     isChild ? 1 : 0,
//     new Date().toISOString()
//   );

//   return { id, name, avatar, isChild };
// };

export const getProfilesByUser = (userId) => {

  return db.prepare(`
    SELECT id, name, avatar, isChild
    FROM profiles
    WHERE userId = ?
  `).all(userId);
};

export const deleteProfile = (profileId, userId) => {

  const profile = db.prepare(`
    SELECT * FROM profiles WHERE id = ? AND userId = ?
  `).get(profileId, userId);

  if (!profile) {
    const error = new Error("Perfil no encontrado");
    error.status = 404;
    throw error;
  }

  db.prepare("DELETE FROM profiles WHERE id = ?").run(profileId);

  return true;
};
