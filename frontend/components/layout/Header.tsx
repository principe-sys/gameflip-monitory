'use client';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            GameFlip Management Dashboard
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </header>
  );
}

