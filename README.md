# TPI — Inventario (Frontend + Backend en Node.js/Express)
Aplicación web simple de **inventario** con:
- **CRUD de productos** (ABM completo)
- **Pantalla de reporte** (stock por categoría y valor total)
- **Autenticación** con registro, login y JWT

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

---

## Ejecutar en producción
```bash
npm run build
npm start
```
El servidor se levanta en http://localhost:3000

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

---

## Flujo de uso
1. Crear usuario en `register.html`
2. Iniciar sesión en `login.html` (se guarda el JWT en `localStorage`)
3. Usar `index.html` para el CRUD y `report.html` para el reporte
4. Cerrar sesión quitando el token de `localStorage`

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
package.json
```