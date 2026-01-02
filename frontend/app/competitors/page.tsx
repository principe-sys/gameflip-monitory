'use client';

import { useState } from 'react';
import { useCompetitors, useCreateCompetitor, useDeleteCompetitor } from '@/lib/hooks/useCompetitors';
import { Plus, Trash2, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CompetitorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ owner_id: '', username: '', notes: '' });
  const { data: competitors, isLoading } = useCompetitors();
  const createCompetitor = useCreateCompetitor();
  const deleteCompetitor = useDeleteCompetitor();

  const competitorList = Array.isArray(competitors) ? competitors : (competitors?.data || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createCompetitor.mutate(formData, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ owner_id: '', username: '', notes: '' });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Competitors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Competidor
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Nuevo Competidor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner ID (requerido)
              </label>
              <input
                type="text"
                required
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="us-east-1:..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nombre del competidor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Notas sobre este competidor..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Competitors List */}
      {isLoading ? (
        <div className="text-center py-12">Cargando competidores...</div>
      ) : competitorList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
          <p className="text-gray-500 mb-4">No hay competidores registrados</p>
          <p className="text-sm text-gray-400">
            Agrega un competidor para comenzar a analizar sus listings y precios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitorList.map((competitor: any) => (
            <div
              key={competitor.id || competitor.owner_id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {competitor.username || competitor.owner_id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{competitor.owner_id}</p>
                </div>
                <button
                  onClick={() => deleteCompetitor.mutate(competitor.id || competitor.owner_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {competitor.notes && (
                <p className="text-sm text-gray-600 mb-4">{competitor.notes}</p>
              )}
              <div className="flex space-x-2">
                <Link
                  href={`/competitors/${competitor.id || competitor.owner_id}/listings`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Listings
                </Link>
                <Link
                  href={`/competitors/${competitor.id || competitor.owner_id}/analytics`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

