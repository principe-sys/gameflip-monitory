'use client';

import { useDashboardSummary } from '@/lib/hooks/useDashboard';
import { DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar el dashboard: {(error as Error).message}</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Balance USD',
      value: `$${((data?.balance_usd || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Balance FLP',
      value: data?.balance_flp || '0.0',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Listings On Sale',
      value: data?.listings?.onsale || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Ventas (7 días)',
      value: data?.exchanges?.last_7_days || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Listings Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Listings por Estado
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{data?.listings?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On Sale</span>
              <span className="font-semibold text-green-600">
                {data?.listings?.onsale || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft</span>
              <span className="font-semibold text-yellow-600">
                {data?.listings?.draft || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sold</span>
              <span className="font-semibold text-blue-600">
                {data?.listings?.sold || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-red-600">
                {data?.listings?.expired || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">KPIs</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas (7 días)</span>
              <span className="font-semibold">{data?.kpis?.sales_per_week || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas (30 días)</span>
              <span className="font-semibold">{data?.kpis?.sales_per_month || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de Conversión</span>
              <span className="font-semibold">
                {data?.kpis?.conversion_rate?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Exchanges</span>
              <span className="font-semibold">{data?.exchanges?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

