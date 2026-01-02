# GameFlip Management Frontend

Frontend Next.js para gestionar listings, analytics y competidores de GameFlip.

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.local.example .env.local

# Editar .env.local y configurar la URL de tu API backend
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001) en tu navegador.

### Producción

```bash
npm run build
npm start
```

## 📁 Estructura

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Página Dashboard
│   ├── analytics/         # Página Analytics
│   ├── listings/          # Página Listings
│   ├── competitors/       # Página Competitors
│   ├── accounts/          # Página Accounts
│   ├── exchanges/         # Página Exchanges
│   ├── wallet/            # Página Wallet
│   ├── settings/          # Página Settings
│   ├── layout.tsx         # Layout principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── ...               # Otros componentes
├── lib/                  # Utilidades y hooks
│   ├── api.ts            # Cliente API
│   └── hooks/            # React Query hooks
└── public/               # Archivos estáticos
```

## 🛠️ Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos utility-first
- **React Query** - Manejo de estado y cache
- **TanStack Table** - Tablas avanzadas
- **Recharts** - Gráficos
- **React Hook Form** - Formularios
- **Axios** - Cliente HTTP

## 📡 API Integration

El frontend se conecta al backend en `http://localhost:3000` por defecto.

Configura la URL en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎨 Características

### Dashboard
- Resumen de balance y listings
- KPIs y métricas
- Stats cards

### Analytics
- Gráficos de ventas
- Análisis de listings
- Alertas automáticas

### Listings
- Tabla de listings con filtros
- Crear/editar/eliminar listings
- Cambiar estado (draft/onsale)
- Subir fotos y códigos digitales

### Competitors
- Listar competidores
- Ver listings de competidores
- Comparar precios
- Analytics competitivos

## 🔧 Desarrollo

### Agregar nueva página

1. Crear archivo en `app/[nombre]/page.tsx`
2. Agregar ruta en `components/layout/Sidebar.tsx`
3. Crear hooks en `lib/hooks/use[Nombre].ts` si es necesario

### Agregar nuevo hook

Crear archivo en `lib/hooks/use[Nombre].ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../api';

export function useMiHook() {
  return useQuery({
    queryKey: ['mi-key'],
    queryFn: () => endpoints.miEndpoint().then(res => res.data),
  });
}
```

## 📝 Notas

- El frontend usa React Query para cache automático
- Las mutaciones invalidan queries relacionadas automáticamente
- Los estilos usan TailwindCSS con tema claro por defecto

