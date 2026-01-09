import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Competitors from './pages/Competitors';
import CompetitorDetail from './pages/CompetitorDetail';
import Accounts from './pages/Accounts';
import Login from './pages/Login';
import Wallet from './pages/Wallet';

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/competitors" element={<Competitors />} />
          <Route path="/competitors/:id" element={<CompetitorDetail />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
