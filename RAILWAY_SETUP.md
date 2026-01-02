# 🚂 Guía de Despliegue en Railway

Railway es una excelente opción para desplegar tu aplicación. Esta guía te mostrará cómo configurarlo.

## 🎯 Por qué Railway

✅ **Ventajas**:
- Despliegue rápido y fácil (Express + Next.js)
- Variables de entorno simples de configurar
- Base de datos incluida (PostgreSQL, MySQL, MongoDB)
- Dominio temporal automático (.railway.app)
- Escalado automático
- Soporte para monorepos (múltiples servicios)
- Gratis hasta cierto uso

✅ **Perfecto para tu proyecto**:
- Backend Express + Frontend Next.js
- Necesitas variables de entorno (API keys)
- Escalable para crecimiento futuro

## 📋 Prerequisitos

1. Cuenta en [Railway](https://railway.app) (puedes usar GitHub para login)
2. Tu proyecto en un repositorio Git (GitHub, GitLab, etc.)

## 🚀 Opción 1: Dos Servicios Separados (Recomendado)

Railway puede detectar automáticamente tu proyecto y crear servicios separados.

### Paso 1: Conectar Repositorio

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### Paso 2: Crear Servicio Backend

1. En tu proyecto Railway, click "New Service"
2. Selecciona "GitHub Repo" y elige tu repositorio
3. Railway detectará automáticamente que es Node.js

**Configuración del Backend:**
- **Root Directory**: `/` (raíz del proyecto)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Variables de Entorno (Settings → Variables):**
```env
GAMEFLIP_API_KEY=tu_api_key_aqui
GAMEFLIP_API_SECRET=tu_api_secret_aqui
GAMEFLIP_ENV=production
NODE_ENV=production
PORT=3000
```

**Puerto:**
- Railway asigna automáticamente un puerto
- Usa `process.env.PORT` (ya está configurado en `server.js`)

### Paso 3: Crear Servicio Frontend

1. En el mismo proyecto Railway, click "New Service" nuevamente
2. Selecciona "GitHub Repo" (el mismo repositorio)
3. Railway detectará Next.js automáticamente

**Configuración del Frontend:**
- **Root Directory**: `/frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Variables de Entorno:**
```env
NEXT_PUBLIC_API_URL=https://tu-backend-service.railway.app
NODE_ENV=production
```

**IMPORTANTE:** Necesitas la URL del backend. Railway genera URLs como:
- `tu-backend-service-production.up.railway.app`

Puedes obtenerla en:
1. Settings del servicio backend
2. Variables → `RAILWAY_PUBLIC_DOMAIN` (si está habilitado)
3. O usar la URL del dominio personalizado si lo configuras

### Paso 4: Configurar Dominio Personalizado (Opcional pero Recomendado)

1. En cada servicio, ve a Settings → Networking
2. Click "Generate Domain" para obtener URL pública
3. O configura un dominio personalizado

**Ejemplo de URLs:**
- Backend: `api-tuproyecto.railway.app` o `backend-tuproyecto.up.railway.app`
- Frontend: `tuproyecto.railway.app` o `frontend-tuproyecto.up.railway.app`

## 🔧 Configuración Alternativa: Railway.toml

Puedes crear un archivo `railway.toml` en la raíz para configurar ambos servicios:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100

# Backend Service
[service]
name = "backend"
rootDirectory = "."

[service.variables]
NODE_ENV = "production"

# Frontend Service (se configura separadamente en Railway)
# O puedes usar un archivo railway.toml en /frontend
```

Y en `frontend/railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100

[service]
name = "frontend"
rootDirectory = "frontend"

[service.variables]
NODE_ENV = "production"
```

**Nota:** Railway puede detectar automáticamente Node.js/Next.js, así que estos archivos son opcionales.

## 🔐 Variables de Entorno en Railway

### Backend (Servicio 1)

En Railway Dashboard → Tu Servicio Backend → Variables:

```env
# GameFlip API (OBLIGATORIAS)
GAMEFLIP_API_KEY=tu_api_key
GAMEFLIP_API_SECRET=tu_api_secret
GAMEFLIP_ENV=production

# Node.js
NODE_ENV=production
PORT=3000

# Opcionales (configuración)
ALERT_NOT_SELLING_DAYS=7
CHECK_COMPETITORS_INTERVAL=daily
ENABLE_PRICE_ALERTS=true
DEFAULT_CURRENCY=USD
AUTO_PUBLISH=false
AUTO_REPRICING_ENABLED=false
```

### Frontend (Servicio 2)

```env
# URL del Backend (IMPORTANTE: Usa la URL del servicio backend)
NEXT_PUBLIC_API_URL=https://tu-backend-service.railway.app

# Node.js
NODE_ENV=production
```

**Cómo obtener la URL del backend:**
1. Ve al servicio backend en Railway
2. Settings → Networking
3. Copia la URL pública (ej: `backend-production.up.railway.app`)
4. Úsala en `NEXT_PUBLIC_API_URL` del frontend

## 📝 Actualizar Código (Si es Necesario)

Railway asigna puertos dinámicamente. Tu código ya está listo:

**Backend (`app/server.js`):**
```javascript
const port = process.env.PORT || 3000; // ✅ Ya está así
```

**Frontend (`lib/api.ts`):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // ✅ Ya está así
```

## 🗄️ Base de Datos (Opcional - Para el Futuro)

Si quieres agregar una base de datos:

1. En Railway Dashboard, click "New Service"
2. Selecciona "Database" → PostgreSQL (o MySQL/MongoDB)
3. Railway creará automáticamente:
   - `DATABASE_URL` en variables de entorno
   - Conexión lista para usar

**Ejemplo de uso:**
```javascript
// En tu backend
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## 🚦 Workflow de Despliegue

1. **Push a GitHub** → Railway detecta cambios automáticamente
2. **Build automático** → Railway ejecuta `npm install` y build
3. **Deploy** → Aplica cambios
4. **URLs automáticas** → Disponibles inmediatamente

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de uso (CPU, memoria, red)
- Historial de deploys
- Rollback fácil (click en versión anterior)

## 💰 Costos

**Plan Gratis (Hobby):**
- $5 crédito gratis por mes
- Suficiente para desarrollo/testing
- Reinicia cada mes

**Plan Pro ($20/mes):**
- Mejor para producción
- Sin límites estrictos
- Soporte prioritario

## 🐛 Solución de Problemas

### Backend no inicia

**Error:** "Cannot find module"
- Verifica que `package.json` tenga todas las dependencias
- Revisa logs en Railway Dashboard

**Error:** "Port already in use"
- Railway asigna el puerto automáticamente
- Asegúrate de usar `process.env.PORT`

### Frontend no conecta al backend

**Error:** CORS o ECONNREFUSED
- Verifica `NEXT_PUBLIC_API_URL` en variables de entorno del frontend
- Asegúrate de usar la URL completa del backend (con https://)
- Verifica que el backend esté corriendo

### Variables de entorno no funcionan

- Las variables deben empezar con `NEXT_PUBLIC_` para ser accesibles en el frontend
- Reinicia el servicio después de cambiar variables
- Verifica que no haya espacios extras

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Railway
- [ ] Servicio Backend creado
- [ ] Variables de entorno del backend configuradas
- [ ] Backend desplegado y funcionando
- [ ] URL del backend copiada
- [ ] Servicio Frontend creado
- [ ] `NEXT_PUBLIC_API_URL` configurado en frontend
- [ ] Frontend desplegado y funcionando
- [ ] Probar conexión frontend → backend
- [ ] Dominios personalizados configurados (opcional)

## 🎯 Ventajas sobre Desarrollo Local

1. **Siempre disponible** - No necesitas mantener tu PC encendida
2. **Acceso desde cualquier lugar** - URL pública
3. **CI/CD automático** - Push = deploy
4. **Escalable** - Fácil de escalar según necesidad
5. **Base de datos incluida** - PostgreSQL/MySQL listo para usar
6. **HTTPS automático** - SSL/TLS incluido

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Ejemplos Railway](https://github.com/railwayapp/railway-examples)

---

**¿Necesitas ayuda?** Revisa los logs en Railway Dashboard o la documentación oficial.

