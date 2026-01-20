import { useMemo, useState } from 'react';
import PageContainer from '../components/PageContainer';
import RequestPanel from '../components/RequestPanel';

const Listings = () => {
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [listingId, setListingId] = useState('');
  const [statusListingId, setStatusListingId] = useState('');

  const queryPath = useMemo(() => {
    const params = new URLSearchParams();
    if (status.trim()) params.set('status', status.trim());
    if (platform.trim()) params.set('platform', platform.trim());
    if (category.trim()) params.set('category', category.trim());
    const query = params.toString();
    return `/api/listings${query ? `?${query}` : ''}`;
  }, [status, platform, category]);

  const detailPath = listingId.trim()
    ? `/api/listings/${listingId.trim()}`
    : '/api/listings/{id}';

  const statusPath = statusListingId.trim()
    ? `/api/listings/${statusListingId.trim()}/status`
    : '/api/listings/{id}/status';
  import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useListings, type Listing } from '../hooks/useListings';

function pickFirstPhotoUrl(listing: Listing): string | null {
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
    const firstActive = values.find((p) => p?.view_url || p?.url) ?? values[0];
    return firstActive?.view_url ?? firstActive?.url ?? null;
  }

  return listing?.photo_url ?? listing?.image_url ?? null;
}

function formatUSD(raw: any): string {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return '—';

  // Heurística: si viene como entero “grande”, tratar como centavos
  const isCentsLikely = Number.isInteger(n) && n >= 1000;
  const value = isCentsLikely ? n / 100 : n;

  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function Listings() {
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('onsale');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');

  const filters = useMemo(
    () => ({ term, status, platform, category }),
    [term, status, platform, category]
  );

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error, refetch } =
    useListings(filters);

  const listings = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((p) => p.listings ?? []);
  }, [data]);

  const found = data?.pages?.[0]?.found ?? listings.length;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Listings</h1>
          <p style={{ margin: 0, color: '#516079' }}>
            Mostrando {listings.length} de {found}
          </p>
        </div>
        <button className="button" onClick={() => refetch()} disabled={isLoading}>
          Refresh
        </button>
      </header>

      <section className="panel">
        <div className="listings-toolbar">
          <label className="field">
            <span>Term</span>
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="zelda, knife..." />
          </label>

          <label className="field">
            <span>Status</span>
            <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="onsale" />
          </label>

          <label className="field">
            <span>Platform</span>
            <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="steam" />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="DIGITAL_INGAME"
            />
          </label>
        </div>
      </section>

      {error ? (
        <section className="panel">
          <strong>Error</strong>
          <p style={{ marginBottom: 0 }}>{String(error)}</p>
        </section>
      ) : null}

      {isLoading ? <div className="panel">Cargando listings...</div> : null}

      <section className="listings-grid">
        {listings.map((listing) => {
          const id = String(listing.id ?? '');
          const title = listing.name ?? listing.title ?? '(sin título)';
          const price = formatUSD(listing.price);
          const thumb = pickFirstPhotoUrl(listing);

          return (
            <article key={id} className="listing-card">
              <div className="listing-thumb">
                {thumb ? (
                  <img src={thumb} alt={title} loading="lazy" />
                ) : (
                  <div className="listing-thumb__placeholder">No image</div>
                )}
              </div>

              <div className="listing-body">
                <div className="listing-title" title={title}>
                  {title}
                </div>

                <div className="listing-meta">
                  <span className="chip">{listing.status ?? '—'}</span>
                  <span className="chip">{listing.platform ?? '—'}</span>
                  <span className="chip">{listing.category ?? '—'}</span>
                </div>

                <div className="listing-price">{price}</div>

                {listing.description ? (
                  <p className="listing-desc">{String(listing.description).slice(0, 140)}...</p>
                ) : (
                  <p className="listing-desc listing-desc--muted">Sin descripción.</p>
                )}

                <div className="listing-actions">
                  <Link className="button button--secondary" to={`/listings/${id}`}>
                    Ver detalles
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel" style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="button"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {hasNextPage ? (isFetchingNextPage ? 'Cargando...' : 'Cargar más') : 'No hay más páginas'}
        </button>
      </section>
    </div>
  );
}


  return (
    <PageContainer
      title="Listings Explorer"
      description="Search listings, fetch details, create listings, and update listing status."
    >
      <section className="card">
        <h2>Search listings</h2>
        <div className="filters">
          <label className="label">
            Status
            <input
              className="input"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              placeholder="onsale"
            />
          </label>
          <label className="label">
            Platform
            <input
              className="input"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              placeholder="steam"
            />
          </label>
          <label className="label">
            Category
            <input
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="DIGITAL_INGAME"
            />
          </label>
        </div>
        <RequestPanel title="List listings" method="GET" path={queryPath} hideBody />
      </section>

      <section className="card">
        <h2>Listing details</h2>
        <label className="label">
          Listing ID
          <input
            className="input"
            value={listingId}
            onChange={(event) => setListingId(event.target.value)}
            placeholder="listing id"
          />
        </label>
        <RequestPanel title="Get listing by ID" method="GET" path={detailPath} hideBody />
      </section>

      <section className="card">
        <h2>Create a listing</h2>
        <RequestPanel
          title="Create listing"
          method="POST"
          path="/api/listings"
          initialBody={JSON.stringify(
            {
              title: 'Sample listing title',
              description: 'Sample listing description',
              price: 1.99,
              category: 'DIGITAL_INGAME',
              kind: 'item'
            },
            null,
            2
          )}
        />
      </section>

      <section className="card">
        <h2>Update listing status</h2>
        <label className="label">
          Listing ID
          <input
            className="input"
            value={statusListingId}
            onChange={(event) => setStatusListingId(event.target.value)}
            placeholder="listing id"
          />
        </label>
        <RequestPanel
          title="Update status"
          method="PUT"
          path={statusPath}
          initialBody={JSON.stringify(
            {
              status: 'onsale'
            },
            null,
            2
          )}
        />
      </section>
    </PageContainer>
  );
};

export default Listings;
