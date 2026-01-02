'use client';

import { useState } from 'react';
import { useMarketSearch } from '@/lib/hooks/useMarket';
import { charm9 } from '@/lib/utils/priceAnalysis';

export default function MarketPage() {
  const [keywords, setKeywords] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [showRed9, setShowRed9] = useState(false);
  
  const { data, isLoading } = useMarketSearch({
    keywords,
    platform,
    category,
    status: 'onsale',
    limit: 100,
  });

  const listings = data?.listings || [];
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mercado</h1>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Palabras clave
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="roblox gems, steam gift card..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="roblox, steam, ps, xbox..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="DIGITAL_INGAME, GIFT_CARD..."
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRed9}
              onChange={(e) => setShowRed9(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Mostrar redondeo a 9c (charm pricing)</span>
          </label>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Estadísticas de Precios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Count</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Min</p>
              <p className="text-2xl font-bold">${(stats.min / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Median</p>
              <p className="text-2xl font-bold">${(stats.median / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Undercut Sugerido</p>
              <p className="text-2xl font-bold text-green-600">
                ${(stats.undercut / 100).toFixed(2)}
              </p>
              {showRed9 && (
                <p className="text-sm text-gray-500">
                  Con 9c: ${(charm9(stats.undercut) / 100).toFixed(2)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">P25</p>
              <p className="text-lg font-semibold">${(stats.p25 / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mean</p>
              <p className="text-lg font-semibold">${(stats.mean / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">P75</p>
              <p className="text-lg font-semibold">${(stats.p75 / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Max</p>
              <p className="text-lg font-semibold">${(stats.max / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Listings */}
      {isLoading ? (
        <div className="text-center py-12">Cargando mercado...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
          <p className="text-gray-500">No hay resultados. Prueba con diferentes filtros.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {listings.length} resultados
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
                  {showRed9 && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio (9c)
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.slice(0, 100).map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                      {listing.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                          {listing.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${((listing.price || 0) / 100).toFixed(2)}
                      </span>
                    </td>
                    {showRed9 && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          ${(charm9(listing.price || 0) / 100).toFixed(2)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.platform || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.category || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

