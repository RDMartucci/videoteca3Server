<h1 align="center">VideoTeca3Server</h1>

<p align="center">Arquitectura robusta de Backend para Streaming Privado, es decir, de forma local y construido con la eficiencia de SQLite WAL.  
Está desarrollado con Node.js y Express, y que también permite indexar carpetas del sistema, explorar archivos, obtener metadata desde TMDB, reproducir videos localmente y gestionar posters.</p>

>Incluye logging profesional con Winston, watcher de carpetas y arquitectura modular.
---

<h2 align="center">💎 Características del Proyecto></h2>

Este servidor no solo entrega archivos; gestiona una experiencia multimedia completa con las siguientes tecnologías:
- ## 🚀 Streaming Adaptativo: 
Implementación de HTTP Range Requests para soporte nativo de scroll en video HTML5.
- ## ⚡ Alto Rendimiento: 
Motor de base de datos better-sqlite3 operando en modo WAL para evitar bloqueos.
- ## 🧠 Inteligencia Lazy: 
Metadata de TMDB que se descarga solo bajo demanda, optimizando el almacenamiento.
- ## 🛡️ Capa de Seguridad: 
Middleware global de errores y validación de esquemas reutilizable.

y tambien: 
- ✅ Cache en memoria.
- ✅ Historial persistente (Continue Watching).
- ✅ Paginación real.
- ✅ Validación estructurada reusable.
- ✅ Arquitectura modular limpia.
---

<h2 align="center">🏗️ Estructura y Diseño</h2>

### 📂 Organización de Capas

| Directorio | Responsabilidad |
|------------|-----------------|
|src/controllers|Orquestación de entrada/salida y códigos HTTP.|
|src/services|Cerebro del sistema: Lógica de streaming e indexación.|
|src/db|Persistencia y optimización de tablas SQL.|
|src/validators|Esquemas de validación de datos entrantes.|
---

### 🛠️ Tecnologías utilizadas
![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![Express](https://img.shields.io/badge/Express-5.x-black)
![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-personal-lightgrey)

---

<h2 align="center">🚀 Guía de Pruebas en Postman</h2>

Sigue este flujo para validar que tu servidor está configurado correctamente.   

**1️⃣ Inicialización (Indexación)**   

POST {{base_url}}/api/index

Escanea tus carpetas físicas y llena la base de datos.   
Respuesta Exitosa (200 OK):   
*<p align="left">JSON  
{
"success": true,   
"message": "Indexación completada",  
"stats": {   
"added": 45,   
"skipped": 2 }  
}</p>*

**2️⃣ Exploración de Contenido**

GET {{base_url}}/api/browse?page=1&limit=10&category=Accion

Respuesta con Paginación:
*<p align="left">JSON  
{
  "data": [  
    {  
      "id": "uuid-123",  
      "title": "Inception",  
      "poster": "https://image.tmdb.org/t/p/w500/...",  
      "rating": 8.8  
    }  
  ],  
  "meta": { "total": 150, "pages": 15 }}</p>*

**3️⃣ Control de Historial**

POST {{base_url}}/api/history   
Cuerpo (JSON):   
JSON{  
  "mediaId": "uuid-123",  
  "progress": 3500,  
  "duration": 7200  
}  

--- 

<h3 align="center">🛠️ Configuración del Entorno</h3> 

>Asegúrate de tener Node.js 22.x instalado para total compatibilidad con las últimas características. 

1. **Clonar e instalar**  

```bash
npm install
```

2. **Configurar variables (.env)**

PORT=5000
TMDB_TOKEN=tu_api_key_aqui

3. **Lanzar en modo producción**

```bash
npm start

```

<h3 align="center">📋 Especificaciones Técnicas (DB)</h3>
Tabla:media


| Campo | Tipo | Función |
|-------|------|--------|
| **cleanTitle** | String | Título normalizado para búsquedas. |
| **path** | String | Ruta física absoluta del archivo.|
| **hasMetadata** | Boolean | Flag para evitar llamadas dobles a TMDB. |
