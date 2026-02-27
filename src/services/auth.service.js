// auth.service.js
//
// Servicio de autenticación: registro y login de usuarios.
// Utiliza bcrypt para hashing de contraseñas y JWT para tokens de sesión.
// 🔥 Mejora: Al registrar un usuario, se crea automáticamente un perfil default para él.
// 🔥 Mejora: Manejo de errores con mensajes claros y códigos de estado HTTP.
// 🔥 Mejora: Configuración de JWT con variables de entorno para mayor seguridad.
// NOTA: En un proyecto real, este servicio debería estar separado en controladores y modelos,
// y la lógica de base de datos debería estar abstraída en un repositorio o DAO.
// NOTA: Este código es un ejemplo simplificado para propósitos educativos y no debe usarse 
// en producción sin las debidas mejoras de seguridad y arquitectura.
// NOTA: Asegúrate de tener una tabla "users" con columnas (id, username, password, role, createdAt)
// y una tabla "profiles" con columnas (id, userId, name, isDefault, createdAt) en tu base de datos SQLite. 
//

import db from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const JWT_EXPIRES = "7d";

/**
 * Registrar usuario
 */
export const registerUser = async ({ username, password, role = "user" }) => {

  const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (existing) {
    const error = new Error("Usuario ya existe");
    error.status = 400;
    throw error;
  }

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (id, username, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    userId,
    username,
    hashedPassword,
    role,
    new Date().toISOString()
  );

  // 🔥 Crear perfil default automáticamente
  db.prepare(`
    INSERT INTO profiles (id, userId, name, isDefault, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    userId,
    username,
    1,
    new Date().toISOString()
  );

  return { username, role };
};
// export const registerUser = async ({ username, password, role = "user" }) => {

//   const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
//   if (existing) {
//     const error = new Error("Usuario ya existe");
//     error.status = 400;
//     throw error;
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   db.prepare(`
//     INSERT INTO users (id, username, password, role, createdAt)
//     VALUES (?, ?, ?, ?, ?)
//   `).run(
//     uuidv4(),
//     username,
//     hashedPassword,
//     role,
//     new Date().toISOString()
//   );

//   return { username, role };
// };

/**
 * Login usuario
 */
export const loginUser = async ({ username, password }) => {

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return { token };
};
