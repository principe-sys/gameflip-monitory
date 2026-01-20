import { Link, useParams } from 'react-router-dom';
import { useListing } from '../hooks/useListing';

function extractPhotos(listing: any): string[] {
  const photo = listing?.photo ?? listing?.photos ?? listing?.images;
  if (!photo) return [];

  if (typeof photo === 'string') return [photo];

  if (Array.isArray(photo)) {
    return photo
      .map((p) => (typeof p === 'string' ? p : p?.view_url ?? p?.url))
      .filter(Boolean);
  }

  if (typeof photo === 'object') {
    return Object.values(photo)
      .map((p: any) => p?.view_url ?? p?.url)
      .filter(Boolean);
  }

  return [];
}

export default function ListingDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useListing(id);

  if (isLoading) return <div className="page"><div className="panel">Cargando detalle...</div></div>;
  if (error || !data) return <div className="page"><div className="panel">Error cargando detalle.</div></div>;

  const title = data.name ?? data.title ?? id;
  const photos = extractPhotos(data);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 style={{ marginBottom: 6 }}>{title}</h1>
          <p style={{ margin: 0, color: '#516079' }}>{id}</p>
        </div>
        <Link className="button" to="/listings">Volver</Link>
      </header>

      <section className="panel">
        <h2>Fotos</h2>
        {photos.length ? (
          <div className="photos-grid">
            {photos.map((url) => (
              <img key={url} src={url} alt="" loading="lazy" />
            ))}
          </div>
        ) : (
          <p style={{ marginBottom: 0, color: '#516079' }}>Sin fotos.</p>
        )}
      </section>

      <section className="panel">
        <h2>Detalle</h2>
        <ul className="kv-grid">
          <li><strong>Status</strong><span>{String(data.status ?? '—')}</span></li>
          <li><strong>Platform</strong><span>{String(data.platform ?? '—')}</span></li>
          <li><strong>Category</strong><span>{String(data.category ?? '—')}</span></li>
          <li><strong>Price</strong><span>{String(data.price ?? '—')}</span></li>
          <li><strong>Condition</strong><span>{String(data.condition ?? '—')}</span></li>
          <li><strong>Updated</strong><span>{String(data.updated ?? '—')}</span></li>
          <li><strong>Created</strong><span>{String(data.created ?? '—')}</span></li>
        </ul>
      </section>

      <section className="panel">
        <h2>Descripción</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{String(data.description ?? '—')}</p>
      </section>

      <details className="panel">
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Raw JSON</summary>
        <pre style={{ overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
