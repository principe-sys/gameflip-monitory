'use client';

import { useParams } from 'next/navigation';
import { useCompetitorAnalytics } from '@/lib/hooks/useCompetitors';

export default function CompetitorAnalyticsPage() {
  const params = useParams();
  const competitorId = params?.id as string;
  
  const { data, isLoading } = useCompetitorAnalytics(competitorId);

  if (isLoading) {
    return <div className="text-center py-12">Cargando analytics del competidor...</div>;
  }

  const analytics = data?.data || data;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Analytics: {competitorId}
      </h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Listings del Competidor</p>
          <p className="text-2xl font-bold mt-2">
            {analytics?.competitor_listings_count || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Tus Listings</p>
          <p className="text-2xl font-bold mt-2">
            {analytics?.your_listings_count || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Matches</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">
            {analytics?.matches?.length || 0}
          </p>
        </div>
      </div>

      {/* Matches */}
      {analytics?.matches && analytics.matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Productos Similares ({analytics.matches.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio Competidor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tu Precio</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Diferencia</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Recomendación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.matches.map((match: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium">{match.name}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      ${((match.competitor_price || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      ${((match.your_price || 0) / 100).toFixed(2)}
                    </td>
                    <td className={`px-4 py-2 text-sm font-semibold ${
                      match.price_difference < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(Math.abs(match.price_difference) / 100).toFixed(2)}
                      {match.price_difference_percent !== undefined && (
                        <span className="text-xs ml-1">
                          ({match.price_difference_percent.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        match.recommendation === 'lower_your_price'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {match.recommendation === 'lower_your_price' ? 'Bajar precio' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Oportunidades */}
      {analytics?.opportunities && analytics.opportunities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            Oportunidades ({analytics.opportunities.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Productos que el competidor vende pero tú no
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Precio</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Platform</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.opportunities.slice(0, 30).map((opp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{opp.name}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      ${((opp.price || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{opp.category || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{opp.platform || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!analytics || (analytics.matches?.length === 0 && analytics.opportunities?.length === 0)) && (
        <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
          <p className="text-gray-500">No hay datos de comparación disponibles</p>
        </div>
      )}
    </div>
  );
}

