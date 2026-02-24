🎬 Videoteca3Server
Backend multimedia de alto rendimiento inspirado en el ecosistema de Netflix y Plex.

🌟 Características Principales
Una arquitectura diseñada para la velocidad y la escalabilidad modular.

⚡ Streaming Nativo: Soporte para HTTP Range, permitiendo rebobinar y adelantar videos al instante.

📂 Indexación Inteligente: Escaneo automático de carpetas locales para construir tu biblioteca.

🧠 Metadata Lazy: Conexión con TMDB para obtener posters y detalles solo cuando los necesitas.

💾 Persistencia Pro: Historial de reproducción (Continue Watching) basado en base de datos SQLite con modo WAL.

🛡️ Hardening: Validaciones estructuradas y manejo global de errores para un sistema robusto.

🏗️ Arquitectura del Sistema
El flujo de datos sigue un patrón de capas para separar la lógica de negocio del acceso a datos.

graph TD
    A[Frontend: React/Vite] -->|API REST| B[Express API]
    B --> C[Service Layer]
    C --> D[(SQLite DB)]
    C --> E[Local Filesystem]

📁 Organización del Código

src/
 ├── controllers/   # Gestión de peticiones y respuestas
 ├── services/      # Lógica de negocio (Streaming, Indexación)
 ├── db/            # Configuración de SQLite (better-sqlite3)
 ├── middlewares/   # Seguridad y manejo de errores
 └── routes/        # Definición de rutas de la API


 📡 Referencia de la API
Todos los endpoints utilizan el prefijo /api.

🔍 Exploración y Media
Método	Endpoint	Descripción
GET	/api/browse	Lista la biblioteca con filtros (page, limit, search).
GET	/api/media/:id	Obtiene detalles y activa búsqueda de metadata.
GET	/api/stream/:id	Inicia el streaming progresivo compatible con HTML5.

⚙️ Configuración y Control

Método	Endpoint	Descripción
POST	/api/index	Inicia el escaneo de archivos físicos.
GET	/api/history	Recupera el historial de reproducción activo.
GET	/api/health	Verifica la disponibilidad del servidor.

🚀 Instalación Rápida
1.Instalar dependencias:

npm install

2.Configurar el entorno:
Crea un archivo .env en la raíz del proyecto:

TMDB_TOKEN=tu_token_aqui
PORT=5000

3.Iniciar servidor:
npm start

🗄️ Detalle de Base de Datos
Utilizamos better-sqlite3 para una latencia mínima.

Ubicación: /data/videoteca.db

Tabla Media: Almacena rutas, metadata, ratings y categorías.

Tabla History: Registra el progreso en segundos de cada archivo.

🛣️ Roadmap
[ ] Implementar autenticación JWT.

[ ] Generación de miniaturas (FFmpeg).

[ ] Soporte para múltiples perfiles.

[ ] Transcodificación adaptativa.

