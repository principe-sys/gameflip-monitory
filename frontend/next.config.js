/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones de compilación
  swcMinify: true,
  // Nota: compiler.removeConsole no es compatible con Turbopack
  // Se puede habilitar cuando se use 'next build' (producción sin turbo)
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  
  // Experimental features para mejor performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

module.exports = nextConfig

