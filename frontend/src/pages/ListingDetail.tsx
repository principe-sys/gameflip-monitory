import { Link, useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import JsonViewer from '../components/JsonViewer';
import { useListing } from '../hooks/useListing';

function extractPhotos(listing: any): string[] {
  const photo = listing?.photo ?? listing?.photos ?? listing?.images;
  if (!photo) return [];
  if (typeof photo === 'string') return [photo];
  if (Array.isArray(photo)) return photo.map((p) => (typeof p === 'string' ? p : p?.view_url ?? p?.url)).filter(Boolean);
  if (typeof photo === 'object') return Object.values(photo).map((p: any) => p?.view_url ?? p?.url).filter(Boolean);
  return [];
}

export default function ListingDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useListing(id);

  if (isLoading) return <PageContainer title="Listing" description="Cargando..."><section className="card">Cargando...</section></PageContainer>;
  if (error || !data) return <PageContainer title="Listing" description="Error"><section className="card">Error cargando detalle.</section></PageContainer>;

  const title = data.name ?? data.title ?? id;
  const photos = extractPhotos(data);

  return (
    <PageContainer title={String(title)} description={String(id)}>
      <section className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="button" to="/listings">Volver</Link>
      </section>

      <section className="card">
        <h2>Fotos</h2>
        {photos.length ? (
          <div className="photos-grid">
            {photos.map((url) => <img key={url} src={url} alt="" loading="lazy" />)}
          </div>
        ) : (
          <p>Sin fotos.</p>
        )}
      </section>

      <details className="card">
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Raw JSON</summary>
        <JsonViewer data={data} />
      </details>
    </PageContainer>
  );
}
