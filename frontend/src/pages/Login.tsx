import { useState } from 'react';
import { apiFetch } from '../lib/api';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/login', { method: 'POST' });
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <p>Start a session to manage multiple GameFlip accounts.</p>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Create session'}
      </button>
    </div>
  );
};

export default Login;
