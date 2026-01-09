import { Link } from 'react-router-dom';
import { useCompetitors } from '../hooks/useCompetitors';

const Competitors = () => {
  const { data, isLoading } = useCompetitors();

  return (
    <div className="page">
      <h1>Competitors</h1>
      {isLoading && <p>Loading competitors...</p>}
      <ul className="list-grid">
        {(data || []).map((competitor) => (
          <li key={competitor.id}>
            <strong>{competitor.name}</strong>
            <span>{competitor.slug || competitor.id}</span>
            <Link to={`/competitors/${competitor.id}`}>View details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Competitors;
