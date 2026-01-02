'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { format } from 'date-fns';

type ExchangeTab = 
  | 'all' 
  | 'pending' 
  | 'inprogress' 
  | 'received' 
  | 'underreview' 
  | 'cancelled' 
  | 'complete';

type InProgressSubTab = 
  | 'need_send' 
  | 'need_tracking' 
  | 'need_ship' 
  | 'need_label' 
  | 'shipped';

export default function ExchangesPage() {
  const [activeTab, setActiveTab] = useState<ExchangeTab>('all');
  const [inProgressSubTab, setInProgressSubTab] = useState<InProgressSubTab | null>(null);

  // Fetch all exchanges
  const { data, isLoading } = useQuery({
    queryKey: ['exchanges', 'seller'],
    queryFn: () => endpoints.exchanges.list({ role: 'seller' }).then(res => res.data),
  });

  const allExchanges = Array.isArray(data) ? data : (data?.data || []);

  // Categorize exchanges
  const categorizedExchanges = useMemo(() => {
    const categories: Record<string, any[]> = {
      all: allExchanges,
      pending: [],
      inprogress: [],
      received: [],
      underreview: [],
      cancelled: [],
      complete: [],
      // In-progress subcategories
      need_send: [],
      need_tracking: [],
      need_ship: [],
      need_label: [],
      shipped: [],
    };

    allExchanges.forEach((exchange: any) => {
      const status = exchange.status?.toLowerCase() || '';
      const handlingStatus = exchange.handling_status?.toLowerCase() || '';
      const isDigital = exchange.digital === true || exchange.category === 'DIGITAL_INGAME' || exchange.category === 'GIFT_CARD';

      // Categorize by status
      if (status === 'pending') {
        categories.pending.push(exchange);
      } else if (status === 'received') {
        categories.received.push(exchange);
      } else if (status === 'cancelled' || status === 'rescinded') {
        categories.cancelled.push(exchange);
      } else if (status === 'complete') {
        categories.complete.push(exchange);
      } else if (status === 'pending_completion' || status === 'pending_rescinding' || status === 'pending_cancel') {
        categories.underreview.push(exchange);
      } else if (status === 'settled') {
        // In-progress exchanges (settled status)
        categories.inprogress.push(exchange);
        
        // Subcategorize by handling_status and digital
        if (isDigital) {
          // Digital items that need to be sent
          categories.need_send.push(exchange);
        } else {
          // Physical items
          if (handlingStatus === 'need_label') {
            categories.need_label.push(exchange);
          } else if (handlingStatus === 'need_tracking') {
            categories.need_tracking.push(exchange);
          } else if (handlingStatus === 'shipping') {
            categories.need_ship.push(exchange);
          } else if (handlingStatus === 'shipped') {
            categories.shipped.push(exchange);
          } else {
            // Default to need_label if no handling_status
            categories.need_label.push(exchange);
          }
        }
      }
    });

    return categories;
  }, [allExchanges]);

  // Get exchanges to display
  const displayedExchanges = useMemo(() => {
    if (activeTab === 'all') {
      return categorizedExchanges.all;
    } else if (activeTab === 'inprogress' && inProgressSubTab) {
      return categorizedExchanges[inProgressSubTab] || [];
    } else {
      return categorizedExchanges[activeTab] || [];
    }
  }, [activeTab, inProgressSubTab, categorizedExchanges]);

  const tabs: { key: ExchangeTab; label: string; count?: number }[] = [
    { key: 'all', label: 'Show All', count: categorizedExchanges.all.length },
    { key: 'pending', label: 'Pending', count: categorizedExchanges.pending.length },
    { key: 'inprogress', label: 'In-Progress', count: categorizedExchanges.inprogress.length },
    { key: 'received', label: 'Received', count: categorizedExchanges.received.length },
    { key: 'underreview', label: 'Under Review / Dispute', count: categorizedExchanges.underreview.length },
    { key: 'cancelled', label: 'Cancelled', count: categorizedExchanges.cancelled.length },
    { key: 'complete', label: 'Complete', count: categorizedExchanges.complete.length },
  ];

  const inProgressSubTabs: { key: InProgressSubTab; label: string; count?: number }[] = [
    { key: 'need_send', label: 'Need to Send (digital)', count: categorizedExchanges.need_send.length },
    { key: 'need_tracking', label: 'Need Tracking (physical)', count: categorizedExchanges.need_tracking.length },
    { key: 'need_ship', label: 'Need to Ship (physical)', count: categorizedExchanges.need_ship.length },
    { key: 'need_label', label: 'Need Shipping Label (physical)', count: categorizedExchanges.need_label.length },
    { key: 'shipped', label: 'Already Sent / Shipped', count: categorizedExchanges.shipped.length },
  ];

  const handleTabChange = (tab: ExchangeTab) => {
    setActiveTab(tab);
    if (tab !== 'inprogress') {
      setInProgressSubTab(null);
    } else if (!inProgressSubTab) {
      // Default to first sub-tab when switching to inprogress
      setInProgressSubTab('need_send');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando exchanges...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Exchanges / Ventas</h1>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Main Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
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

        {/* In-Progress Sub-Tabs */}
        {activeTab === 'inprogress' && (
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex -mb-px overflow-x-auto px-4" aria-label="Sub-Tabs">
              {inProgressSubTabs.map((subTab) => {
                const isActive = inProgressSubTab === subTab.key;
                return (
                  <button
                    key={subTab.key}
                    onClick={() => setInProgressSubTab(subTab.key)}
                    className={`
                      px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors
                      ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {subTab.label}
                    {subTab.count !== undefined && (
                      <span className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${
                        isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {subTab.count || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Exchanges Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Listing ID / Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Comprador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Handling Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedExchanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay exchanges en esta categoría
                  </td>
                </tr>
              ) : (
                displayedExchanges.map((exchange: any, index: number) => (
                  <tr key={exchange.id || exchange.exchange_id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-600">
                        {exchange.listing_id || exchange.id || '-'}
                      </div>
                      {exchange.name && (
                        <div className="text-sm font-medium text-gray-900 mt-1">{exchange.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exchange.buyer_id || exchange.buyer || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${((exchange.price || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          exchange.status === 'complete'
                            ? 'bg-green-100 text-green-800'
                            : exchange.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : exchange.status === 'settled'
                            ? 'bg-blue-100 text-blue-800'
                            : exchange.status === 'received'
                            ? 'bg-purple-100 text-purple-800'
                            : exchange.status === 'cancelled' || exchange.status === 'rescinded'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {exchange.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exchange.handling_status ? (
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                          {exchange.handling_status}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exchange.created || exchange.date
                        ? format(new Date(exchange.created || exchange.date), 'dd MMM yyyy')
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
