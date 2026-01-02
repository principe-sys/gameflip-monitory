'use client';

import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AccountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => endpoints.accounts.list().then(res => res.data),
  });

  const accounts = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <Link
          href="/accounts/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Cuenta
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
          <p className="text-gray-500">No hay accounts encontrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: any) => (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{account.name}</h3>
              <p className="text-sm text-gray-600 mb-4">ID: {account.id}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Precio:</span>
                <span className="text-lg font-semibold">
                  ${((account.price || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="mt-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    account.status === 'onsale'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {account.status}
                </span>
              </div>
              <Link
                href={`/accounts/${account.id}`}
                className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

