## 🎬 Videoteca3Server

Arquitectura robusta de Backend para Streaming Privado. > Inspirado en la fluidez de Netflix, construido con la eficiencia de SQLite WAL.

## 💎 Diferenciales del Proyecto

Este servidor no solo entrega archivos; gestiona una experiencia multimedia completa con las siguientes tecnologías:

🚀 Streaming Adaptativo: Implementación de HTTP Range Requests para soporte nativo de scroll en video HTML5.

⚡ Alto Rendimiento: Motor de base de datos better-sqlite3 operando en modo WAL para evitar bloqueos.

🧠 Inteligencia Lazy: Metadata de TMDB que se descarga solo bajo demanda, optimizando el almacenamiento.

🛡️ Capa de Seguridad: Middleware global de errores y validación de esquemas reutilizable.

🏗️ Estructura y Diseño
📂 Organización de Capas

Directorio	Responsabilidad
src/controllers	Orquestación de entrada/salida y códigos HTTP.
src/services	Cerebro del sistema: Lógica de streaming e indexación.
src/db	Persistencia y optimización de tablas SQL.
src/validators	Esquemas de validación de datos entrantes.

🚀 Guía de Pruebas en Postman
Sigue este flujo para validar que tu servidor está configurado correctamente.

1️⃣ Inicialización (Indexación)
POST {{base_url}}/api/index

Escanea tus carpetas físicas y llena la base de datos.

Respuesta Exitosa (200 OK):

{
  "success": true,
  "message": "Indexación completada",
  "stats": { "added": 45, "skipped": 2 }
}

2️⃣ Exploración de Contenido
GET {{base_url}}/api/browse?page=1&limit=10&category=Accion

Respuesta con Paginación:

{
  "data": [
    {
      "id": "uuid-123",
      "title": "Inception",
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "rating": 8.8
    }
  ],
  "meta": { "total": 150, "pages": 15 }
}


3️⃣ Control de Historial
POST {{base_url}}/api/history

Cuerpo (JSON):

{
  "mediaId": "uuid-123",
  "progress": 3500,
  "duration": 7200
}


🛠️ Configuración del Entorno
[!TIP]
Asegúrate de tener Node.js 22.x instalado para total compatibilidad con las últimas características.

# 1. Clonar e instalar

npm install

# 2. Configurar variables (.env)

PORT=5000
TMDB_TOKEN=tu_api_key_aqui

# 3. Lanzar en modo producción

npm start


