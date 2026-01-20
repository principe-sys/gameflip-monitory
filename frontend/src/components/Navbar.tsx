import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar__brand">GameFlip Monitor</div>
      <nav className="navbar__links">
        <NavLink to="/" end className="navbar__link">
          Dashboard
        </NavLink>
        <NavLink to="/analytics" className="navbar__link">
          Analytics
        </NavLink>
        <NavLink to="/competitors" className="navbar__link">
          Competitors
        </NavLink>
        <NavLink to="/accounts" className="navbar__link">
          Accounts
        </NavLink>
        <NavLink to="/wallet" className="navbar__link">
          Wallet
        </NavLink>
        <NavLink to="/listings" className="navbar__link">
          Listings
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
