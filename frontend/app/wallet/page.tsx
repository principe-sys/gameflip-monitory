'use client';

import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function WalletPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => endpoints.wallet.get({ balance_only: true, flp: true }).then(res => res.data),
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance USD</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${((data?.cash_balance || 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Held Balance</p>
            <p className="text-lg font-semibold text-gray-700">
              ${((data?.held_cash_balance || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance FLP</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data?.balance?.FLP || '0.0'}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          {data?.balance && (
            <div className="mt-4 space-y-2">
              {Object.entries(data.balance).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-semibold">{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">GBUX Balance</p>
            <p className="text-lg font-semibold">{data?.gbux_balance || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Bonus Balance</p>
            <p className="text-lg font-semibold">{data?.bonus_balance || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GFLP Balance</p>
            <p className="text-lg font-semibold">{data?.gflp_balance || '0.0'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Owner</p>
            <p className="text-sm font-mono text-gray-700 truncate">{data?.owner || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

