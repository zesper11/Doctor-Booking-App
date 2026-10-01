import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/authContext";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const { user, logout: signOut } = useAuth();

  const logout = async () => {
    setAuthError("");
    try {
      await signOut();
      setShowAccountMenu(false);
      navigate("/");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return (
    <nav className="site-nav relative flex items-center justify-between border-b border-b-gray-400 py-4 mb-5 mt-1 text-sm">
      <Link to="/" aria-label="Prescripto home">
        <img src={assets.logo} alt="Prescripto" className="w-44" />
      </Link>
      <button
        className="site-nav-mobile-toggle"
        type="button"
        aria-label={showMenu ? "Close navigation" : "Open navigation"}
        aria-expanded={showMenu}
        onClick={() => setShowMenu((isOpen) => !isOpen)}
      >
        <img src={showMenu ? assets.cross_icon : assets.menu_icon} alt="" />
      </button>
      <ul className={showMenu ? "site-nav-links is-open" : "site-nav-links"}>
        <li>
          <NavLink onClick={() => setShowMenu(false)} to="/">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink onClick={() => setShowMenu(false)} to="/doctors">
            Doctors
          </NavLink>
        </li>
        <li>
          <NavLink onClick={() => setShowMenu(false)} to="/about">
            About
          </NavLink>
        </li>
        <li>
          <NavLink onClick={() => setShowMenu(false)} to="/contact">
            Contact
          </NavLink>
        </li>
        {!user && (
          <li className="site-nav-mobile-auth">
            <Link to="/login" onClick={() => setShowMenu(false)}>
              Log in
            </Link>
            <Link to="/signup" onClick={() => setShowMenu(false)}>
              Sign up
            </Link>
          </li>
        )}
      </ul>

      <div className="site-nav-account">
        {user ? (
          <div className="relative">
            <button
              className="site-nav-user"
              type="button"
              aria-expanded={showAccountMenu}
              onClick={() => setShowAccountMenu((isOpen) => !isOpen)}
            >
              <img src={assets.profile_pic} alt="" />
              <span>{user.name}</span>
              <img
                className="site-nav-chevron"
                src={assets.dropdown_icon}
                alt=""
              />
            </button>
            {showAccountMenu && (
              <div className="site-nav-account-menu">
                <Link to="/profile" onClick={() => setShowAccountMenu(false)}>
                  My profile
                </Link>
                <Link
                  to="/my-appointments"
                  onClick={() => setShowAccountMenu(false)}
                >
                  My appointments
                </Link>
                <button type="button" onClick={logout}>
                  Sign out
                </button>
                {authError && <p role="alert">{authError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="site-nav-auth">
            <Link to="/login">Log in</Link>
            <Link className="site-nav-signup" to="/signup">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
