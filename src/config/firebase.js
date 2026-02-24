// src/config/firebase.js
//
// Configuración de Firebase Admin SDK para autenticación y otras funcionalidades de Firebase.
// Asegúrate de tener el archivo serviceAccountKey.json con las credenciales de tu proyecto Firebase
// en la raíz del proyecto o ajusta la ruta según sea necesario.
//
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
