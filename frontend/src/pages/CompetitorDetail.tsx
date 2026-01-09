import { useParams } from 'react-router-dom';
import { useCompetitor, useCompetitorAnalytics } from '../hooks/useCompetitors';

const CompetitorDetail = () => {
  const { id } = useParams();
  const competitor = useCompetitor(id);
  const analytics = useCompetitorAnalytics(id);

  return (
    <div className="page">
      <h1>Competitor Detail</h1>
      <section className="panel">
        <h2>Profile</h2>
        <pre>{JSON.stringify(competitor.data || {}, null, 2)}</pre>
      </section>
      <section className="panel">
        <h2>Analytics</h2>
        <pre>{JSON.stringify(analytics.data || {}, null, 2)}</pre>
      </section>
    </div>
  );
};

export default CompetitorDetail;
