import { FormEvent, useState } from 'react';
import { useAccounts, useCreateAccount, useSelectAccount } from '../hooks/useAccounts';

const Accounts = () => {
  const accounts = useAccounts();
  const createAccount = useCreateAccount();
  const selectAccount = useSelectAccount();
  const [form, setForm] = useState({ name: '', apiKey: '', apiSecret: '' });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.apiKey || !form.apiSecret) return;
    createAccount.mutate(form);
    setForm({ name: '', apiKey: '', apiSecret: '' });
  };

  return (
    <div className="page">
      <h1>Accounts</h1>
      <section className="panel">
        <h2>Saved accounts</h2>
        <ul className="list-grid">
          {(accounts.data || []).map((account) => (
            <li key={account.id}>
              <strong>{account.name}</strong>
              <span>{account.apiKey}</span>
              <button onClick={() => selectAccount.mutate(account.id)}>Set active</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>Add account</h2>
        <form onSubmit={onSubmit} className="form-grid">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            placeholder="API Key"
            value={form.apiKey}
            onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
          />
          <input
            placeholder="API Secret"
            type="password"
            value={form.apiSecret}
            onChange={(event) => setForm({ ...form, apiSecret: event.target.value })}
          />
          <button type="submit">Save</button>
        </form>
      </section>
    </div>
  );
};

export default Accounts;
