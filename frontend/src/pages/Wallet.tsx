import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

const Wallet = () => {
  const [months, setMonths] = useState('');
  const { data, isLoading } = useWallet(
    months
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  if (isLoading) {
    return <div className="page">Loading wallet data...</div>;
  }

  return (
    <div className="page">
      <h1>Wallet</h1>
      <label className="field">
        <span>Months (YYYY-MM, comma separated)</span>
        <input value={months} onChange={(event) => setMonths(event.target.value)} />
      </label>
      <pre>{JSON.stringify(data || {}, null, 2)}</pre>
    </div>
  );
};

export default Wallet;
