import { priceAnalysis } from '../lib/priceAnalysis';
import { useAnalyticsListings, useAnalyticsOverview, useAnalyticsSales } from '../hooks/useAnalytics';

const Analytics = () => {
  const overview = useAnalyticsOverview();
  const listings = useAnalyticsListings();
  const sales = useAnalyticsSales();

  const priceSample = priceAnalysis([
    { price: 10 },
    { price: 12 },
    { price: 11 },
    { price: 14 }
  ]);

  return (
    <div className="page">
      <h1>Analytics</h1>
      <section className="panel">
        <h2>Overview</h2>
        <pre>{JSON.stringify(overview.data || {}, null, 2)}</pre>
      </section>
      <section className="panel">
        <h2>Listings</h2>
        <pre>{JSON.stringify(listings.data || {}, null, 2)}</pre>
      </section>
      <section className="panel">
        <h2>Sales</h2>
        <pre>{JSON.stringify(sales.data || {}, null, 2)}</pre>
      </section>
      <section className="panel">
        <h2>Price Analysis</h2>
        <pre>{JSON.stringify(priceSample, null, 2)}</pre>
      </section>
    </div>
  );
};

export default Analytics;
