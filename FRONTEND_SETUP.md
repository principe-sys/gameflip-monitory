# Frontend Setup - GameFlip Management

## 🚀 Instalación y Configuración

### Paso 1: Instalar Dependencias

```bash
cd frontend
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Crear archivo .env.local
cp .env.local.example .env.local
```

Editar `.env.local` y configurar:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Paso 3: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3001**

## 📁 Estructura Creada

```
frontend/
├── app/                          # Next.js App Router
│   ├── dashboard/               # ✅ Dashboard principal
│   ├── analytics/               # ✅ Analytics con gráficos
│   ├── listings/                # ✅ Gestión de listings
│   ├── competitors/             # ✅ Gestión de competidores
│   ├── accounts/                # ✅ Gestión de cuentas
│   ├── exchanges/               # ✅ Historial de ventas
│   ├── wallet/                  # ✅ Wallet y balance
│   ├── settings/                # ✅ Configuración
│   ├── bulk/                    # ⚠️ Bulk (placeholder)
│   ├── layout.tsx               # Layout principal con Sidebar
│   ├── page.tsx                 # Redirige a /dashboard
│   └── globals.css              # Estilos Tailwind
├── components/
│   └── layout/
│       ├── Sidebar.tsx          # ✅ Navegación lateral
│       └── Header.tsx           # ✅ Header superior
├── lib/
│   ├── api.ts                   # ✅ Cliente API con Axios
│   └── hooks/
│       ├── useDashboard.ts      # ✅ Hooks para dashboard
│       ├── useAnalytics.ts      # ✅ Hooks para analytics
│       ├── useListings.ts       # ✅ Hooks para listings
│       └── useCompetitors.ts    # ✅ Hooks para competitors
└── package.json                 # ✅ Dependencias configuradas
```

## ✅ Características Implementadas

### Dashboard (`/dashboard`)
- ✅ Resumen de balance USD/FLP
- ✅ Stats cards con iconos
- ✅ Listings por estado
- ✅ KPIs (conversión, ventas, etc.)

### Analytics (`/analytics`)
- ✅ Vista general de métricas
- ✅ Gráfico de tendencias de ventas (Recharts)
- ✅ Alertas con prioridad
- ✅ Listings que no venden

### Listings (`/listings`)
- ✅ Tabla de listings con filtros
- ✅ Acciones: editar, pausar/publicar, eliminar
- ✅ Estados visuales con colores
- ✅ Formato de precios y fechas

### Competitors (`/competitors`)
- ✅ Listar competidores
- ✅ Formulario para agregar competidor
- ✅ Enlaces a listings y analytics de cada competidor
- ✅ Eliminar competidores

### Wallet (`/wallet`)
- ✅ Balance USD y FLP
- ✅ Held balance
- ✅ Información adicional (GBUX, Bonus, etc.)

### Exchanges (`/exchanges`)
- ✅ Tabla de ventas
- ✅ Filtros por estado
- ✅ Formato de fechas

### Accounts (`/accounts`)
- ✅ Listar cuentas
- ✅ Cards con información básica
- ✅ Estados visuales

### Settings (`/settings`)
- ✅ Ver configuración actual
- ✅ Estado de API keys

## 🎨 Diseño

- **TailwindCSS** para estilos
- **Lucide React** para iconos
- **Recharts** para gráficos
- Tema claro por defecto
- Responsive design

## 🔧 Próximos Pasos Recomendados

1. **Páginas de Detalle**:
   - `/listings/[id]` - Ver/editar listing individual
   - `/competitors/[id]/listings` - Listings de competidor
   - `/competitors/[id]/analytics` - Analytics competitivo

2. **Formularios**:
   - Crear/editar listing con React Hook Form
   - Subir fotos
   - Subir códigos digitales

3. **Mejoras UI**:
   - Loading states mejorados
   - Error boundaries
   - Toast notifications para acciones
   - Modales para confirmaciones

4. **Funcionalidades Adicionales**:
   - Export CSV de listings/exchanges
   - Filtros avanzados
   - Búsqueda
   - Paginación

## 🐛 Solución de Problemas

### Error: Module not found
```bash
# Asegúrate de instalar todas las dependencias
cd frontend
npm install
```

### Error: API connection
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Verifica `NEXT_PUBLIC_API_URL` en `.env.local`

### Puerto ocupado
Next.js usa el puerto 3000 por defecto. Si está ocupado, usará 3001 automáticamente.

## 📝 Notas

- El frontend usa **React Query** para cache automático
- Las mutaciones invalidan queries relacionadas automáticamente
- Todos los endpoints están tipados con TypeScript
- La estructura sigue las mejores prácticas de Next.js 14 App Router

