# TPI — Inventario (Frontend + Backend en Node.js/Express)
Aplicación web simple de **inventario** con:
- **CRUD de productos** (ABM completo)
- **Pantalla de reporte** (stock por categoría y valor total)
- **Autenticación** con registro, login y JWT
---

---

## Novedades / Cambios realizados
- Pruebas de integración con Jest + Supertest para Auth y Productos.
- Conversión de `price` y `stock` aceptando formatos locales (p. ej. "1.234,56").
- Endpoint de reporte: `GET /api/reports/stock/summary` (valor total y stock por categoría).
- Build de frontend con esbuild hacia `dist/public` (HTML/JS/CSS minificados).
- Autenticación con JWT y endpoint protegido `/api/auth/users`.
- Persistencia en JSON en `src/data/` con seeds automáticos en primer arranque.

---

## Requisitos
- Node.js 18+

---

## Instalación
```bash
npm install
```

---

## Ejecutar en desarrollo
```bash
npm run dev
```
Abrir en el navegador:
- http://localhost:3000/login.html → **Login**
- http://localhost:3000/register.html → **Registro**
- http://localhost:3000/index.html → **CRUD de productos**
- http://localhost:3000/report.html → **Reporte**
- http://localhost:3000/users.html → **Usuarios** (requiere token)

---

## Ejecutar en producción
```bash
npm run build
npm start
```
El servidor se levanta en http://localhost:3000

Los archivos estáticos se sirven desde `dist/public`. CSS y JS con cache prolongada; `.html` con `no-cache`.

---

## Scripts
```bash
npm start        # producción (requiere build)
npm run dev      # desarrollo con nodemon

npm run build    # build completo (JS+CSS+HTML)
npm run build:js # bundle/minify JS a dist/public/*.min.js
npm run build:css# minify CSS a dist/public/style.min.css
npm run copy:html# copia HTML a dist/public/*.html

npm test         # ejecutar pruebas
```

---

## Variables de entorno
- `JWT_SECRET`: clave para firmar tokens. Por defecto: `dev-secret-CHANGE-ME`.

Ejemplo (PowerShell/Windows):
```powershell
$env:JWT_SECRET = "cambia-esta-clave"; npm run dev
```

---

## Testing
```bash
npm test
```
Ejecuta pruebas de endpoints con **Jest + Supertest**.

---

## API (nivel 2 REST)
Base URL: `/api`

### Productos
- **GET** `/api/products` — Lista productos
- **GET** `/api/products/:id` — Obtiene producto por ID
- **POST** `/api/products` — Crea producto
```json
{
  "name": "Notebook 14\"",
  "sku": "NB-14-001",
  "category": "Computo",
  "price": 850000,
  "stock": 12
}
```
- **PUT** `/api/products/:id` — Actualiza (body parcial)
- **DELETE** `/api/products/:id` — Elimina

Notas:
- `name` y `sku` son obligatorios al crear (400 si faltan).
- `price` acepta número o string; se normaliza formato local (coma decimal).
- `stock` se convierte a número; valores inválidos → 0.

### Reportes
- **GET** `/api/reports/stock/summary`
```json
{
  "byCategory": { "Computo": 12, "Accesorios": 45 },
  "totalValue": 1200000
}
```

### Autenticación (opcional)
Base URL: `/api/auth`

- **POST** `/api/auth/register` — Registra usuario
```json
{ "username": "123", "password": "123" }
```

- **POST** `/api/auth/login` — Devuelve JWT
```json
{ "token": "secret..." }
```

- **GET** `/api/auth/users` — Lista usuarios (protegido)

Enviar token en el header:
```
Authorization: Bearer <token>
```

---

## Persistencia
- **Productos:** `src/data/products.json` (se genera desde `products.seed.json` al primer arranque)
- **Usuarios:** `src/data/users.json` (creados desde `register.html`)

Para reiniciar datos locales, elimina los JSON y reinicia el servidor; se regeneran desde los seeds cuando aplique.

---

## Flujo de uso
1. Crear usuario en `register.html`
2. Iniciar sesión en `login.html` (se guarda el JWT en `localStorage`)
3. Usar `index.html` para el CRUD y `report.html` para el reporte
4. Cerrar sesión quitando el token de `localStorage`

`users.html` consume `/api/auth/users` y requiere token válido.

---

## Estructura del proyecto
```
src/
  server.js
  routes_products.js
  routes_auth.js
  auth_middleware.js
  data/
    db.js
    products.seed.json
    products.json
    users.js
    users.json
  public/
    index.html
    report.html
    login.html
    register.html
    style.css
    app.js
    report.js
tests_products.test.js
tests_auth.test.js
package.json
```

`dist/public/` contiene los artefactos minificados listos para producción.

---

## Notas y limitaciones
- Contraseñas en `users.json` en texto plano (propósitos didácticos). No usar en producción.
- Define `JWT_SECRET` fuera de desarrollo.
- Los endpoints de Productos no exigen auth por ahora; puede ajustarse según requerimientos.