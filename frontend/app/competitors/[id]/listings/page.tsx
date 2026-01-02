'use client';

import { useParams } from 'next/navigation';
import { useCompetitorListings } from '@/lib/hooks/useCompetitors';
import { usePriceComparison } from '@/lib/hooks/useMarket';
import { useListings } from '@/lib/hooks/useListings';
import { useState } from 'react';

export default function CompetitorListingsPage() {
  const params = useParams();
  const competitorId = params?.id as string;
  
  const [statusFilter, setStatusFilter] = useState('onsale');
  
  const { data: competitorListings, isLoading: compLoading } = useCompetitorListings(
    competitorId,
    { status: statusFilter, limit: 100 }
  );
  
  const { data: myListings } = useListings({ owner: 'me', status: 'onsale' });
  
  const listings = competitorListings?.listings || [];
  const myList = Array.isArray(myListings) ? myListings : (myListings?.listings || []);
  
  const { data: comparison } = usePriceComparison(myList, listings);

  if (compLoading) {
    return <div className="text-center py-12">Cargando listings del competidor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Listings del Competidor: {competitorId}
        </h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="onsale">On Sale</option>
          <option value="sold">Sold</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Comparación de precios */}
      {comparison && (comparison.matches.length > 0 || comparison.opportunities.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Comparación con tus Listings</h2>
          
          {comparison.matches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Matches ({comparison.matches.length})</h3>
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
                    {comparison.matches.map((match: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{match.name}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${((match.competitor_price || 0) / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${((match.my_price || 0) / 100).toFixed(2)}
                        </td>
                        <td className={`px-4 py-2 text-sm font-semibold ${
                          match.price_difference < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${(Math.abs(match.price_difference) / 100).toFixed(2)}
                          {match.price_difference_percent && (
                            <span className="text-xs ml-1">
                              ({match.price_difference_percent.toFixed(1)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            match.recommendation === 'lower_price'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {match.recommendation === 'lower_price' ? 'Bajar precio' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {comparison.opportunities.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">
                Oportunidades ({comparison.opportunities.length})
              </h3>
              <p className="text-sm text-gray-600 mb-2">
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
                    {comparison.opportunities.slice(0, 20).map((opp: any, idx: number) => (
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
        </div>
      )}

      {/* Listings del competidor */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {listings.length} listings encontrados
          </p>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing: any) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      ${((listing.price || 0) / 100).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.platform || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {listing.status || 'onsale'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {listings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay listings encontrados
          </div>
        )}
      </div>
    </div>
  );
}

