// src/db/database.js
//
// Inicialización y gestión de SQLite
//

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'videoteca.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Activar WAL para mejor rendimiento
db.pragma('journal_mode = WAL');

// Crear tablas si no existen
db.exec(`
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  name TEXT,
  cleanTitle TEXT,
  year INTEGER,
  type TEXT,
  category TEXT,
  path TEXT UNIQUE,
  fileSize INTEGER,
  poster TEXT,
  backdrop TEXT,
  runtime INTEGER,
  rating REAL,
  hasMetadata INTEGER DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  profileId TEXT,
  mediaId TEXT,
  progress INTEGER,
  duration INTEGER,
  updatedAt TEXT,
  FOREIGN KEY(profileId) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  avatar TEXT,
  isChild INTEGER DEFAULT 0,
  createdAt TEXT,
  FOREIGN KEY(userId) REFERENCES users(id)
);
`);

export default db;