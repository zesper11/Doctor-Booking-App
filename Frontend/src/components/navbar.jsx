import React, { useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(true);

  return (
    <nav className="flex items-center justify-between text-sm py-4 mb-5 mt-1 border-b border-b-gray-400 relative">
      <img
        src={assets.logo}
        alt="Perscripto logo"
        className="w-44 cursor-pointer"
      />
      <ul className="hidden md:flex item-start gap-5">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/doctors">Doctors</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </ul>

      {token ? (
        <div className="nav-profile relative flex items-center gap-3">
          <img
            src={assets.profile_pic}
            className="nav-profile-picture rounded-full w-9 cursor-pointer"
            alt="profile picture"
          />
          <img
            src={assets.dropdown_icon}
            alt="profile picture"
            className="nav-dropdown-icon w-3 cursor-pointer"
            onClick={() => setShowMenu((isOpen) => !isOpen)}
          />
          <div
            className={`absolute right-0 top-full z-10 mt-2 min-w-48 rounded border border-gray-200 bg-white p-4 shadow-md ${
              showMenu ? "block" : "hidden"
            }`}
          >
            <ul className="flex flex-col justify-center gap-4">
              <NavLink className="hover:text-black text-gray-700" to="/profile">
                My Profile
              </NavLink>
              <NavLink
                className="hover:text-black text-gray-700"
                to="/my-appointments"
              >
                My Appointments
              </NavLink>
              <NavLink
                className="text-red-400 hover:text-red-600"
                onClick={() => {
                  setToken((istoken) => !istoken);
                }}
              >
                Logout
              </NavLink>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-500 text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer"
          >
            Create account
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
