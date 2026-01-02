'use client';

import { useState } from 'react';
import { useDashboardListings } from '@/lib/hooks/useDashboard';
import { useUpdateListingStatus, useDeleteListing } from '@/lib/hooks/useListings';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type ListingStatus = 'all' | 'draft' | 'onsale' | 'sold' | 'expired';

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState<ListingStatus>('all');
  const { data, isLoading } = useDashboardListings();
  const updateStatus = useUpdateListingStatus();
  const deleteListing = useDeleteListing();

  // Get counts and listings from the dashboard endpoint
  const counts = data?.counts || {};
  const listingsData = data?.listings || {};
  
  // Get listings for active tab
  const getListingsForTab = (tab: ListingStatus) => {
    if (tab === 'all') {
      return listingsData.all || [];
    }
    return listingsData[tab] || [];
  };

  const displayedListings = getListingsForTab(activeTab);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'onsale' ? 'draft' : 'onsale';
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este listing?')) {
      deleteListing.mutate(id);
    }
  };

  const tabs: { key: ListingStatus; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'draft', label: 'Draft', count: counts.draft },
    { key: 'onsale', label: 'On Sale', count: counts.onsale },
    { key: 'sold', label: 'Sold', count: counts.sold },
    { key: 'expired', label: 'Expired', count: counts.expired },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
        <Link
          href="/listings/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Listings Table */}
        {isLoading ? (
          <div className="text-center py-12">Cargando listings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay listings en esta categoría
                    </td>
                  </tr>
                ) : (
                  displayedListings.map((listing: any) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                        <div className="text-sm text-gray-500">{listing.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${((listing.price || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            listing.status === 'onsale'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : listing.status === 'sold'
                              ? 'bg-blue-100 text-blue-800'
                              : listing.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.created
                          ? new Date(listing.created).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-block"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {listing.status === 'onsale' || listing.status === 'draft' ? (
                          <button
                            onClick={() => handleStatusChange(listing.id, listing.status)}
                            className="text-gray-600 hover:text-gray-900 inline-block"
                            title={listing.status === 'onsale' ? 'Pausar' : 'Publicar'}
                          >
                            {listing.status === 'onsale' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        ) : null}
                        {listing.status !== 'sold' && (
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-900 inline-block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
