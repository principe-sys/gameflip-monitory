import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { useListings, type Listing } from '../hooks/useListings';

function pickThumb(listing: Listing): string | null {
  const photo = listing?.photo ?? listing?.photos ?? listing?.images;
  if (typeof photo === 'string') return photo;
  if (Array.isArray(photo)) {
    const first = photo[0];
    if (!first) return null;
    if (typeof first === 'string') return first;
    return first.view_url ?? first.url ?? null;
  }
  if (photo && typeof photo === 'object') {
    const values = Object.values(photo) as any[];
    const first = values.find((p) => p?.view_url || p?.url) ?? values[0];
    return first?.view_url ?? first?.url ?? null;
  }
  return listing?.photo_url ?? listing?.image_url ?? null;
}

function formatUSD(raw: any): string {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return '—';
  const isCentsLikely = Number.isInteger(n) && n >= 1000;
  const value = isCentsLikely ? n / 100 : n;
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function Listings() {
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('onsale');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');

  const filters = useMemo(() => ({ term, status, platform, category }), [term, status, platform, category]);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useListings(filters);

  const listings = useMemo(() => (data?.pages ?? []).flatMap((p) => p.listings ?? []), [data]);
  const found = data?.pages?.[0]?.found ?? listings.length;

  return (
    <PageContainer title="Listings" description={`Mostrando ${listings.length} de ${found}`}>
      <section className="card">
        <div className="filters">
          <label className="label">
            Term
            <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} />
          </label>
          <label className="label">
            Status
            <input className="input" value={status} onChange={(e) => setStatus(e.target.value)} />
          </label>
          <label className="label">
            Platform
            <input className="input" value={platform} onChange={(e) => setPlatform(e.target.value)} />
          </label>
          <label className="label">
            Category
            <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
        </div>
      </section>

      {error ? <section className="card">Error: {String(error)}</section> : null}
      {isLoading ? <section className="card">Cargando...</section> : null}

      <section className="listings-grid">
        {listings.map((l) => {
          const id = String(l.id ?? '');
          const title = l.name ?? l.title ?? '(sin título)';
          const thumb = pickThumb(l);
          return (
            <article key={id} className="listing-card">
              <div className="listing-thumb">
                {thumb ? <img src={thumb} alt={title} loading="lazy" /> : <div className="listing-thumb__placeholder">No image</div>}
              </div>
              <div className="listing-body">
                <div className="listing-title">{title}</div>
                <div className="listing-meta">
                  <span className="chip">{l.status ?? '—'}</span>
                  <span className="chip">{l.platform ?? '—'}</span>
                  <span className="chip">{l.category ?? '—'}</span>
                </div>
                <div className="listing-price">{formatUSD(l.price)}</div>
                <div className="listing-actions">
                  <Link className="button" to={`/listings/${id}`}>Ver detalles</Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="card" style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="button" onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {hasNextPage ? (isFetchingNextPage ? 'Cargando...' : 'Cargar más') : 'No hay más'}
        </button>
      </section>
    </PageContainer>
  );
}
