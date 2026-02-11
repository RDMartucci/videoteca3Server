import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import logger from './logger.js';

try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  logger.info("Firebase Admin SDK inicializado correctamente");
} catch (error) {
  logger.error("Error cargando serviceAccountKey.json para Firebase:", error.message);
}

export const auth = admin.auth();
