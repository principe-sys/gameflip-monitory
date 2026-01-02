'use client';

import { useAnalyticsOverview, useAnalyticsAlerts, useAnalyticsSales } from '@/lib/hooks/useAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: alerts, isLoading: alertsLoading } = useAnalyticsAlerts();
  const { data: sales, isLoading: salesLoading } = useAnalyticsSales();

  if (overviewLoading || alertsLoading || salesLoading) {
    return <div className="text-center py-12">Cargando analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Listings Totales</p>
          <p className="text-2xl font-bold mt-2">{overview?.listings?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Ventas (30 días)</p>
          <p className="text-2xl font-bold mt-2">{overview?.sales?.last_30_days || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">No Venden (>7 días)</p>
          <p className="text-2xl font-bold mt-2 text-red-600">
            {overview?.listings_performance?.not_selling || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Revenue Total</p>
          <p className="text-2xl font-bold mt-2">
            ${((overview?.sales?.total_revenue || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      {sales?.sales_trend && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Tendencia de Ventas (30 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Ventas" />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Alerts */}
      {alerts && alerts.count > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Alertas ({alerts.count})
          </h2>
          <div className="space-y-3">
            {alerts.alerts?.slice(0, 10).map((alert: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{alert.listing_name || alert.listing_id}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{alert.recommendation}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      alert.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {alert.severity === 'high' ? 'Alta' : 'Media'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

