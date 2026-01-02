# Arquitectura del Sistema de Gestión de Listings GameFlip

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Módulos Principales](#módulos-principales)
4. [Próximos Pasos: Integración con Base de Datos](#próximos-pasos)
5. [Ejemplos de Uso](#ejemplos-de-uso)

## 🎯 Visión General

Este sistema proporciona una API completa para gestionar listings de GameFlip, analizar competidores, y obtener métricas de negocio.

### Tecnologías Actuales
- **Backend**: Node.js + Express
- **API Client**: GameFlip API v1
- **Autenticación**: TOTP (Time-based One-Time Password)

### Tecnologías Recomendadas para Escalar
- **Base de Datos**: PostgreSQL o MongoDB
- **Cache**: Redis (para datos de competidores)
- **Frontend**: Next.js + TypeScript + TailwindCSS

## 📡 Endpoints Disponibles

### Dashboard
- `GET /dashboard/summary` - Resumen general (balance, conteos de listings, exchanges)
- `GET /dashboard/listings` - Listados detallados con filtros por estado

### Analytics
- `GET /analytics/overview` - Vista general de métricas y KPIs
- `GET /analytics/listings` - Análisis detallado de listings
- `GET /analytics/sales` - Análisis de ventas y tendencias
- `GET /analytics/alerts` - Alertas de listings que necesitan atención

### Listings
- `GET /listings` - Listar todos los listings (con filtros)
- `GET /listings?owner=me` - Listar listings propios
- `GET /listings/:id` - Obtener un listing específico
- `POST /listings` - Crear nuevo listing
- `PATCH /listings/:id` - Actualizar listing (JSON Patch)
- `PUT /listings/:id/status` - Cambiar estado (draft/ready/onsale)
- `DELETE /listings/:id` - Eliminar listing
- `GET /listings/:id/digital-goods` - Obtener códigos digitales
- `PUT /listings/:id/digital-goods` - Subir códigos digitales
- `POST /listings/:id/photo` - Subir foto

### Competitors (Nuevo)
- `GET /competitors` - Listar todos los competidores guardados
- `POST /competitors` - Crear perfil de competidor
  ```json
  {
    "owner_id": "us-east-1:...",
    "username": "competitor_name",
    "notes": "Optional notes"
  }
  ```
- `GET /competitors/:id` - Obtener perfil de competidor
- `GET /competitors/:id/listings` - Obtener listings de competidor
  - Query params: `?status=onsale&category=DIGITAL_INGAME&limit=50`
- `GET /competitors/:id/analytics` - Comparar precios con tus listings
- `DELETE /competitors/:id` - Eliminar competidor

### Accounts
- `GET /accounts` - Listar cuentas (listings tipo ACCOUNT)
- `GET /accounts/:listingId` - Obtener cuenta específica
- `POST /accounts` - Crear listing de cuenta
- `POST /accounts/:listingId/digital-code` - Subir código digital
- `PUT /accounts/:listingId/publish` - Publicar cuenta

### Exchanges (Ventas)
- `GET /exchanges` - Listar exchanges/ventas
  - Query params: `?role=seller&status=complete&limit=50`
- Respuesta incluye: listing, comprador, fecha, monto, estado

### Wallet
- `GET /wallet` - Obtener balance y movimientos
  - Query params: `?balance_only=true&flp=true&year_month=2026-01`

### Products (Catálogo)
- `GET /products` - Buscar productos en el catálogo
- `GET /products/:id` - Obtener producto específico

### Bulk Operations
- `GET /bulk` - Listar operaciones bulk
- `GET /bulk/:id` - Obtener bulk específico
- `POST /bulk` - Crear nueva operación bulk
- `PUT /bulk/:id` - Actualizar bulk

### Steam
- `GET /steam/escrows` - Listar escrows de Steam
- `GET /steam/escrows/:id` - Obtener escrow específico
- `GET /steam/trade-ban` - Verificar si hay trade ban
- `GET /steam/inventory/:profileId/:appId` - Obtener inventario de Steam

### Profile
- `GET /profile` - Obtener perfil del usuario actual
- `GET /profile?id=user_id` - Obtener perfil de otro usuario

## 🏗️ Módulos Principales

### 1. Dashboard (`/dashboard`)
**Objetivo**: Visión rápida del negocio

**Widgets disponibles**:
- Balance USD/FLP
- Conteo de listings por estado (total, draft, ready, onsale, sold, expired)
- Total de exchanges (ventas)

**Ejemplo de respuesta**:
```json
{
  "balance_usd": 3539,
  "balance_flp": "0.0",
  "listings": {
    "total": 150,
    "draft": 5,
    "ready": 10,
    "onsale": 120,
    "sold": 10,
    "expired": 5
  },
  "exchanges_total": 20
}
```

### 2. Analytics (`/analytics`)
**Objetivo**: Entender qué funciona y qué no

**Métricas disponibles**:
- Listings que no venden (>7 días activos)
- Ventas últimos 7/30 días
- Revenue total
- Precio promedio
- Alertas automáticas

### 3. Competitors (`/competitors`)
**Objetivo**: Analizar estrategia de competidores

**Funcionalidades**:
- Guardar perfiles de competidores (requiere DB)
- Obtener listings de competidores en tiempo real
- Comparar precios automáticamente
- Identificar oportunidades (productos que ellos venden y tú no)

**Ejemplo de uso**:
```bash
# Crear competidor
POST /competitors
{
  "owner_id": "us-east-1:competitor-id",
  "username": "competitor_name"
}

# Obtener sus listings
GET /competitors/us-east-1:competitor-id/listings?status=onsale

# Comparar precios
GET /competitors/us-east-1:competitor-id/analytics
```

### 4. Listings (`/listings`)
**Objetivo**: Gestión completa de listings

**Flujo típico**:
1. `POST /listings` - Crear listing
2. `POST /listings/:id/photo` - Subir fotos
3. `PUT /listings/:id/digital-goods` - Subir códigos (si aplica)
4. `PUT /listings/:id/status` - Cambiar a "onsale"

### 5. Accounts (`/accounts`)
**Objetivo**: Gestión específica de cuentas de videojuegos

**Características especiales**:
- Automáticamente configura `category: "ACCOUNT"`
- Automáticamente configura `digital: true`
- Endpoint específico para publicar cuentas

## 🗄️ Próximos Pasos: Integración con Base de Datos

### Esquema Sugerido (PostgreSQL)

```sql
-- Competidores
CREATE TABLE competitors (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings de competidores (histórico)
CREATE TABLE competitor_listings (
  id SERIAL PRIMARY KEY,
  competitor_id INTEGER REFERENCES competitors(id),
  listing_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  price INTEGER,
  status VARCHAR(50),
  platform VARCHAR(100),
  fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(competitor_id, listing_id, fetched_at)
);

-- Listings propios (snapshot histórico)
CREATE TABLE my_listings_snapshots (
  id SERIAL PRIMARY KEY,
  listing_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  price INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(listing_id, snapshot_date)
);

-- Ventas/Exchanges (histórico)
CREATE TABLE exchanges_history (
  id SERIAL PRIMARY KEY,
  exchange_id VARCHAR(255) UNIQUE NOT NULL,
  listing_id VARCHAR(255),
  buyer_id VARCHAR(255),
  seller_id VARCHAR(255),
  price INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

### Implementación en Node.js

```javascript
// Ejemplo: app/db/models.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = {
  competitors: {
    create: async (data) => {
      const result = await pool.query(
        'INSERT INTO competitors (owner_id, username, notes) VALUES ($1, $2, $3) RETURNING *',
        [data.owner_id, data.username, data.notes]
      );
      return result.rows[0];
    },
    
    findAll: async () => {
      const result = await pool.query('SELECT * FROM competitors ORDER BY created_at DESC');
      return result.rows;
    },
    
    findById: async (id) => {
      const result = await pool.query('SELECT * FROM competitors WHERE id = $1', [id]);
      return result.rows[0];
    }
  },
  
  competitorListings: {
    save: async (competitorId, listings) => {
      // Insertar múltiples listings
      const values = listings.map(l => 
        `(${competitorId}, '${l.id}', '${l.name}', '${l.category}', ${l.price}, '${l.status}', NOW())`
      ).join(',');
      
      await pool.query(`
        INSERT INTO competitor_listings (competitor_id, listing_id, name, category, price, status, fetched_at)
        VALUES ${values}
        ON CONFLICT DO NOTHING
      `);
    }
  }
};
```

### Actualizar Competitors Route

```javascript
// En app/routes/competitors.js, reemplazar TODOs con:
const db = require('../db/models');

// POST /competitors
router.post('/', async (req, res) => {
  try {
    const competitor = await db.competitors.create(req.body);
    res.status(201).json({ status: 'SUCCESS', data: competitor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /competitors/:id/listings
router.get('/:id/listings', async (req, res) => {
  try {
    const competitor = await db.competitors.findById(req.params.id);
    // ... fetch from API ...
    await db.competitorListings.save(competitor.id, listings);
    // ...
  } catch (err) {
    // ...
  }
});
```

## 💡 Ejemplos de Uso

### Flujo 1: Crear y Publicar un Listing

```bash
# 1. Crear listing
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "V-Bucks | 1.000",
    "category": "DIGITAL_INGAME",
    "platform": "unknown",
    "price": 599,
    "digital": true,
    "digital_deliverable": "transfer",
    "tags": ["id: vbucks", "type: V Bucks"]
  }'

# 2. Subir foto (si aplica)
curl -X POST http://localhost:3000/listings/{id}/photo \
  -F "photo=@/path/to/photo.jpg"

# 3. Subir código digital (si aplica)
curl -X PUT http://localhost:3000/listings/{id}/digital-goods \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123DEF456"}'

# 4. Publicar
curl -X PUT http://localhost:3000/listings/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "onsale"}'
```

### Flujo 2: Analizar Competidor

```bash
# 1. Crear perfil de competidor
curl -X POST http://localhost:3000/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "owner_id": "us-east-1:competitor-id",
    "username": "competitor_name"
  }'

# 2. Obtener sus listings
curl "http://localhost:3000/competitors/us-east-1:competitor-id/listings?status=onsale"

# 3. Comparar precios
curl "http://localhost:3000/competitors/us-east-1:competitor-id/analytics"
```

### Flujo 3: Dashboard y Analytics

```bash
# Resumen rápido
curl http://localhost:3000/dashboard/summary

# Analytics detallado
curl http://localhost:3000/analytics/overview

# Alertas
curl http://localhost:3000/analytics/alerts
```

## 🚀 Próximas Mejoras Sugeridas

1. **Autenticación JWT** para proteger endpoints
2. **Caching con Redis** para datos de competidores
3. **Cron Jobs** para actualizar datos automáticamente:
   - Actualizar listings de competidores cada hora
   - Generar alertas diarias
   - Calcular métricas automáticamente
4. **Rate Limiting** más sofisticado
5. **Webhooks** para notificaciones en tiempo real
6. **Export CSV/PDF** de reportes

## 📝 Notas

- Los endpoints de `/competitors` actualmente funcionan en tiempo real (sin base de datos). Para funcionalidad completa de histórico y análisis, se requiere integración con DB.
- Todos los endpoints retornan estructura `{status: "SUCCESS", data: ...}` o `{error: "..."}`
- La paginación está implementada automáticamente en endpoints que lo requieren
- Los límites de rate limiting están configurados en el cliente GameFlip (3 requests/minuto)

