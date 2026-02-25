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

  const hashedPassword = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO users (id, username, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    username,
    hashedPassword,
    role,
    new Date().toISOString()
  );

  return { username, role };
};

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
