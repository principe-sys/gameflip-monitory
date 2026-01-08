import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar__brand">GFAPI Explorer</div>
      <nav className="navbar__links">
        <NavLink to="/" end className="navbar__link">
          Home
        </NavLink>
        <NavLink to="/listings" className="navbar__link">
          Listings
        </NavLink>
        <NavLink to="/wallet" className="navbar__link">
          Wallet
        </NavLink>
        <NavLink to="/profile" className="navbar__link">
          Profile
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
