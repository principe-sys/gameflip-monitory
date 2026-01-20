import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Competitors from './pages/Competitors';
import CompetitorDetail from './pages/CompetitorDetail';
import Accounts from './pages/Accounts';
import Login from './pages/Login';
import Wallet from './pages/Wallet';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';

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
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

        </Routes>
      </main>
    </div>
  );
};

export default App;
