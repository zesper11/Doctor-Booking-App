import React from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between text-sm py-4 mb-5 mt-1 border-b border-b-gray-400">
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
      <div>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-500 text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer"
        >
          Create account
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
