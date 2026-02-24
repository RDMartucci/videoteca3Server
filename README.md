🎬 Videoteca3Server
Videoteca3Server es un backend multimedia de alto rendimiento diseñado para ofrecer una experiencia estilo Plex o Netflix. Está optimizado para streaming fluido en HTML5, gestión de metadata inteligente (Lazy Loading) y una arquitectura modular fácil de escalar.

✨ Características Principales
🚀 Streaming Progresivo: Soporte nativo para HTTP Range Requests, permitiendo saltar a cualquier punto del video instantáneamente.

🗃️ Base de Datos Optimizada: Uso de SQLite con modo WAL (Write-Ahead Logging) para lecturas/escrituras concurrentes ultrarrápidas.

🧠 Metadata Lazy (TMDB): Enriquecimiento automático de información (posters, ratings, sinopsis) solo cuando se solicita.

⚡ Capa de Cache: Sistema de cache en memoria para paginación, reduciendo la carga en disco.

🕒 Historial Persistente: "Continue Watching" integrado para retomar videos donde los dejaste.

🛡️ Hardening & Seguridad: Middleware de errores centralizado, validaciones estructuradas y arquitectura limpia por capas.

🏗️ Arquitectura del Sistema
graph TD
    A[Frontend: React / Vite] -- HTTP/JSON --> B[Express API]
    B --> C[Service Layer: Lógica de Negocio]
    C --> D[(SQLite DB: better-sqlite3)]
    C --> E[Local File System: Media]

    Estructura de Carpetas
    src/
├── controllers/ # Lógica de rutas y respuestas
├── services/    # Lógica de negocio pura
├── db/          # Configuración y esquemas de SQLite
├── middlewares/ # Error handling y validación
├── routes/      # Definición de endpoints
└── utils/       # Helpers y constantes


⚙️ Instalación y Configuración
1. Clonar e Instalar

git clone https://github.com/tu-usuario/videoteca3server.git
cd videoteca3server
npm install


2. Variables de Entorno
Crea un archivo .env en la raíz (opcional para metadata):

PORT=5000
TMDB_TOKEN=tu_token_aqui
NODE_ENV=development


3. Ejecución
# Desarrollo
npm run dev

# Producción
npm start


📡 Guía de API (Endpoints Principales)
Método	Endpoint	Descripción
GET	/api/health	Estado del servidor.
POST	/api/index	Escanea el sistema de archivos e indexa contenido.
GET	/api/browse	Lista paginada de media (soporta search, category, sort).
GET	/api/media/:id	Detalle extendido y trigger de metadata TMDB.
GET	/api/stream/:id	Endpoint de streaming (compatible con <video>).
GET	/api/history	Obtiene la lista de "Seguir viendo".

🛠️ Stack Tecnológico
Runtime: Node.js (v22.x)

Framework: Express.js (v5.x)

Base de Datos: SQLite vía better-sqlite3

Integraciones: TMDB API para metadata

Utilidades: Axios, UUID, Dotenv

🛣️ Roadmap de Próximas Mejoras
[ ] 🔐 Autenticación JWT y perfiles de usuario.

[ ] 🖼️ Generación de thumbnails automáticos con FFmpeg.

[ ] 📝 Soporte para subtítulos externos (.srt, .vtt).

[ ] 📊 Dashboard de estadísticas de uso.

[ ] 🐳 Dockerización del proyecto.

📜 Licencia
Proyecto desarrollado con fines educativos y personales.

Desarrollado con ❤️ para amantes del streaming propio.

