import { useMemo, useState } from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

const Dashboard = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const value = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    return value;
  });
  const { data, isLoading, error } = useDashboardSummary(month);

  const availableBalance = useMemo(() => {
    if (!data) return 0;
    return data.balance_available ?? data.balance_usd - (data.balance_held || 0);
  }, [data]);

  if (isLoading) {
    return <div className="page">Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div className="page">Error loading dashboard.</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <label className="field">
          <span>Month</span>
          <input value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
      </header>
      <section className="cards">
        <div className="card">
          <h3>Balance USD</h3>
          <p>${data.balance_usd.toFixed(2)}</p>
          <small style={{ color: availableBalance < 0 ? 'tomato' : 'inherit' }}>
            Available: ${availableBalance.toFixed(2)} / Held: ${data.balance_held?.toFixed(2) ?? '0.00'}
          </small>
        </div>
        <div className="card">
          <h3>Balance FLP</h3>
          <p>{data.balance_flp}</p>
        </div>
        <div className="card">
          <h3>Listings On Sale</h3>
          <p>{data.listings.onsale}</p>
        </div>
        <div className="card">
          <h3>Sales (7 days)</h3>
          <p>{data.exchanges.last_7_days}</p>
        </div>
      </section>

      <section className="panel">
        <h2>Listings by status</h2>
        <ul className="list-grid">
          {Object.entries(data.listings).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>KPIs</h2>
        <ul className="list-grid">
          <li>
            <strong>Last 7 days</strong>
            <span>{data.exchanges.last_7_days}</span>
          </li>
          <li>
            <strong>Last 30 days</strong>
            <span>{data.exchanges.last_30_days}</span>
          </li>
          <li>
            <strong>Month sales</strong>
            <span>{data.exchanges.month_sales_count ?? 0}</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
