# Guía para probar el servidor con Postman

**Base URL:** `http://localhost:5000`  
Asegúrate de tener el servidor en marcha: `npm start` o `node server.js`

---

## 1. Salud y configuración

### GET `/api/health`
- **Método:** GET  
- **URL:** `http://localhost:5000/api/health`  
- **Body:** ninguno  
- **Respuesta esperada:** `{ status, drives_online, total_drives, details }`

### GET `/api/settings`
- **Método:** GET  
- **URL:** `http://localhost:5000/api/settings`  
- **Body:** ninguno  
- **Respuesta esperada:** `{ paths: [], isFirstStart }` o la config actual

### POST `/api/settings`
- **Método:** POST  
- **Headers:** `Content-Type: application/json`  
- **URL:** `http://localhost:5000/api/settings`  
- **Body (raw → JSON):**
```json
{
  "paths": ["C:\\Videos", "E:\\DESCARGAS 2\\--PELICULAS II"]
}
```
- **Respuesta esperada:** `{ message: "Configuración guardada", movies: [...] }`

---

## 2. Biblioteca de películas (lista indexada)

### GET `/api/browse`
- **Método:** GET  
- **URL:** `http://localhost:5000/api/browse`  
- **Body:** ninguno  
- **Respuesta esperada:** array de películas (nombre, path, poster, category, index)

### POST `/api/scan`
- **Método:** POST  
- **URL:** `http://localhost:5000/api/scan`  
- **Body:** ninguno (o vacío)  
- **Respuesta esperada:** mismo formato que GET `/api/browse` (lista de películas)

---

## 3. Explorador de carpetas (sistema de archivos)

### POST `/api/explorer/browse`
- **Método:** POST  
- **Headers:** `Content-Type: application/json`  
- **URL:** `http://localhost:5000/api/explorer/browse`  

**Opción A – Raíz (ver discos en Windows):**
- **Body (raw → JSON):**
```json
{
  "path": "root"
}
```
o sin body / `{}`.

**Opción B – Carpeta concreta:**
- **Body (raw → JSON):**
```json
{
  "path": "C:\\Users"
}
```

- **Respuesta esperada:**  
  `{ currentPath, parentPath, folders: [{ name, path }], disks, quickAccess }`

---

## 4. Reproducir video

### POST `/api/play`
- **Método:** POST  
- **Headers:** `Content-Type: application/json`  
- **URL:** `http://localhost:5000/api/play`  
- **Body (raw → JSON):**
```json
{
  "index": 0
}
```
`index` es el que viene en cada película de GET `/api/browse`.  
- **Respuesta esperada:** `{ message: "Reproduciendo..." }`

---

## 5. TMDB (búsqueda y detalles)

### GET `/api/search-tmdb?query=Alien`
- **Método:** GET  
- **URL:** `http://localhost:5000/api/search-tmdb?query=Alien`  
  (o `?id=Alien`)  
- **Body:** ninguno  
- **Requisito:** `TMDB_TOKEN` en tu `.env`  
- **Respuesta esperada:** array de hasta 9 resultados con `id, title, poster, year`

### GET `/api/movie-details?id=Alien`
- **Método:** GET  
- **URL:** `http://localhost:5000/api/movie-details?id=Alien`  
- **Body:** ninguno  
- **Requisito:** `TMDB_TOKEN` en `.env`  
- **Respuesta esperada:** objeto con `title, overview, year, backdrop, poster, genres, cast, director, trailerId, runtime, rating`  
  o `{ noData: true, title: "..." }` si no hay resultados

---

## 6. Corregir poster manual (Fix Match)

### POST `/api/fix-match`
- **Método:** POST  
- **Headers:** `Content-Type: application/json`  
- **URL:** `http://localhost:5000/api/fix-match`  
- **Body (raw → JSON):**
```json
{
  "fileName": "Alien (1979).mkv",
  "posterUrl": "https://image.tmdb.org/t/p/w500/abc123.jpg"
}
```
- **Respuesta esperada:** `{ message: "Poster actualizado correctamente" }`

---

## Orden recomendado en Postman

1. **GET** `/api/health` — comprobar que el servidor responde.  
2. **GET** `/api/settings` — ver rutas actuales.  
3. **POST** `/api/settings` con `{ "paths": ["C:\\ruta\\a\\tus\\videos"] }` — guardar al menos una ruta.  
4. **GET** `/api/browse` — listar películas indexadas.  
5. **POST** `/api/explorer/browse` con `{ "path": "root" }` — explorador en raíz.  
6. **POST** `/api/explorer/browse` con `{ "path": "C:\\" }` — abrir una unidad.  
7. **GET** `/api/search-tmdb?query=Matrix` — probar TMDB (si tienes `TMDB_TOKEN`).  
8. **POST** `/api/play` con `{ "index": 0 }` — reproducir la primera película de la lista (solo si hay resultados en `/api/browse`).

---

## Errores habituales en Postman

- **404:** Comprueba que la URL sea exactamente `http://localhost:5000/api/...` (sin barra final en la ruta base).
- **Body vacío en POST:** Elige "Body" → "raw" → tipo "JSON" y escribe un JSON válido.
- **TMDB 401 / vacío:** Revisa que en `.env` esté definido `TMDB_TOKEN` con un token de lectura de la API de TMDB.
