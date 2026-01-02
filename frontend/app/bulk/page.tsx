'use client';

import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';

export default function BulkPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bulk'],
    queryFn: () => endpoints.listings.list({ owner: 'me' }).then(res => res.data), // Using listings as placeholder
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
      <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">Bulk operations coming soon</p>
        <p className="text-sm text-gray-400">
          Esta sección permitirá subir múltiples listings a la vez mediante CSV o JSON
        </p>
      </div>
    </div>
  );
}

