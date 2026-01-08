import { useEffect, useState } from 'react';
import PageContainer from '../components/PageContainer';
import JsonViewer from '../components/JsonViewer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

const Home = () => {
  const [status, setStatus] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        if (!response.ok) {
          setError(`Request failed (${response.status}).`);
        }
        setStatus(data);
      } catch (fetchError) {
        setError('Unable to reach the API.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <PageContainer
      title="API Explorer Home"
      description="Check the backend status and jump into the feature explorers."
    >
      <section className="card">
        <h2>Backend status</h2>
        {loading ? <LoadingSpinner /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        {status ? <JsonViewer data={status} /> : null}
      </section>
      <section className="card">
        <h2>Quick links</h2>
        <ul className="link-list">
          <li>Listings explorer for search, details, create, and status updates.</li>
          <li>Wallet explorer to view balances and history.</li>
          <li>Profile explorer to view account details.</li>
        </ul>
      </section>
    </PageContainer>
  );
};

export default Home;
