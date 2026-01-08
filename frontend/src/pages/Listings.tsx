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
