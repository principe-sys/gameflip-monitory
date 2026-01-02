'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';
import { useState } from 'react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => endpoints.settings.get().then(res => res.data),
  });

  const updateSettings = useMutation({
    mutationFn: (data: any) => endpoints.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Settings actualizados (nota: requieren base de datos para persistencia)');
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Cargando settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">API Key Configurada</p>
            <p className="text-lg font-semibold">
              {settings?.api_keys?.gameflip_api_key_configured ? '✓ Sí' : '✗ No'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Entorno</p>
            <p className="text-lg font-semibold">{settings?.environment || 'development'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Versión</p>
            <p className="text-lg font-semibold">{settings?.version || '1.0.0'}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los settings actualmente se leen de variables de entorno. Para
          persistencia completa, se requiere integración con base de datos.
        </p>
      </div>
    </div>
  );
}

