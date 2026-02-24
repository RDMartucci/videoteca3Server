# 🎬 Videoteca3Server

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![Express](https://img.shields.io/badge/Express-5.x-black)
![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-personal-lightgrey)

Backend multimedia profesional estilo Plex / Netflix.

Diseñado para soportar frontend moderno con virtualización, streaming HTML5 y arquitectura modular escalable.

---

# 🚀 Features

- ✅ Indexación de biblioteca local
- ✅ Base de datos SQLite (WAL)
- ✅ Streaming con soporte HTTP Range
- ✅ Metadata lazy (TMDB)
- ✅ Cache en memoria
- ✅ Historial persistente (Continue Watching)
- ✅ Paginación real
- ✅ Middleware global de errores
- ✅ Validación estructurada reusable
- ✅ Arquitectura modular limpia

---

# 🏗 Arquitectura

            ┌──────────────────────┐
            │      Frontend        │
            │  (React / Vite)      │
            └──────────┬───────────┘
                       │ HTTP
                       ▼
            ┌──────────────────────┐
            │      Express API     │
            │  (Controllers Layer) │
            └──────────┬───────────┘
                       ▼
            ┌──────────────────────┐
            │       Services       │
            │  Business Logic      │
            └──────────┬───────────┘
                       ▼
            ┌──────────────────────┐
            │      SQLite DB       │
            │  better-sqlite3 WAL  │
            └──────────┬───────────┘
                       ▼
            ┌──────────────────────┐
            │  Local File System   │
            │  (Video Library)     │
            └──────────────────────┘
            
---

# 📁 Estructura del Proyecto

src/
├── controllers/
├── services/
├── db/
├── middlewares/
├── validators/
├── routes/
├── utils/
├── app.js
└── server.js


---

# 🗄 Base de Datos

Motor: SQLite  
Driver: better-sqlite3  
Modo: WAL (Write-Ahead Logging)  

Ubicación:

/data/videoteca.db

Tablas principales:

### media
- id
- name
- cleanTitle
- category
- type
- path
- fileSize
- poster
- backdrop
- runtime
- rating
- hasMetadata
- createdAt

### history
- id
- mediaId
- progress
- duration
- updatedAt

---

# ⚙️ Instalación

```bash
npm install

Crear archivo .env (opcional para metadata TMDB):

TMDB_TOKEN=tu_token_aqui

Iniciar servidor:

npm start

Servidor por defecto:

http://localhost:5000


📡 API Endpoints

Prefijo base:
/api

🔍 Health

GET /api/health

Verifica que el servidor esté activo.

⚙️ Configuración

GET /api/settings
POST /api/settings

📚 Biblioteca

GET /api/browse

Query params:

page

limit

category

search

sort

order

Ejemplo:
GET /api/browse?page=1&limit=30

🎞 Media Details

GET /api/media/:id

Obtiene detalles del medio.

Si no tiene metadata → realiza búsqueda lazy en TMDB.

▶ Streaming

GET /api/stream/:id

Compatible con <video> HTML5

Soporta HTTP Range

Streaming progresivo

🕓 Historial

POST /api/history

Body:
{
  "mediaId": "uuid",
  "progress": 120,
  "duration": 5400
}

GET /api/history

Devuelve lista de Continue Watching.

📂 Indexación

POST /api/index

Escanea carpetas configuradas e indexa archivos.

🛡 Hardening Implementado

Middleware global de errores

Async handler centralizado

Validación reusable por esquema

Respuestas de error consistentes

Sanitización básica de parámetros

Separación clara de capas

Ejemplo de error:

{
  "success": false,
  "message": "Page debe ser un número mayor a 0"
}

⚡ Cache Layer

Cache en memoria para resultados paginados

TTL: 5 minutos

Invalida automáticamente tras indexación

🧪 Testing (Postman)

Orden recomendado:

POST /api/index

GET /api/browse

GET /api/media/:id

GET /api/stream/:id

POST /api/history

GET /api/history

🚀 Despliegue
🔹 Producción básica (Node)

npm install --production
npm start

🔹 Usando PM2 (recomendado)

npm install -g pm2
pm2 start server.js --name videoteca
pm2 save
pm2 startup

🔹 Variables de entorno

En producción usar:
NODE_ENV=production
TMDB_TOKEN=token_real
PORT=3000

🔹 Reverse Proxy (Nginx ejemplo)

server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

🛣 Roadmap Profesional

Autenticación JWT

Multiusuario

Perfiles

Rate limiting

Helmet

Logging estructurado

Subtítulos automáticos

Thumbnails con FFmpeg

Transcoding adaptativo

Index incremental

🧑‍💻 Stack

Node.js

Express

SQLite

better-sqlite3

Axios

UUID

📜 Licencia

Proyecto personal / educativo.

🎯 Estado

Backend multimedia funcional y preparado para frontend tipo Netflix / Plex.

