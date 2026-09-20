import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="mt-16 text-sm text-gray-600">
      <div className="grid gap-10 border-b border-gray-200 pb-10 md:grid-cols-[1.6fr_0.8fr_1fr] md:gap-16">
        <div>
          <img src={assets.logo} alt="Prescripto" className="w-44" />
          <p className="mt-5 max-w-[390px] text-[13px] leading-6">
            Prescripto makes quality healthcare easier to access. Find the right
            specialist, choose a convenient time, and manage your care in one
            simple place.
          </p>
        </div>

        <div>
          <h2 className="text-base font-medium uppercase text-gray-900">
            Company
          </h2>
          <div className="mt-5 flex flex-col gap-3 text-[13px]">
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/doctors">Find a doctor</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h2 className="text-base font-medium uppercase text-gray-900">
            Get in touch
          </h2>
          <div className="mt-5 flex flex-col gap-3 text-[13px]">
            <a href="tel:+0000000000">+0-000-000-000</a>
            <a href="mailto:hello@prescripto.dev">hello@prescripto.dev</a>
            <p>Mon - Sat, 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
      <p className="py-5 text-center text-xs text-gray-700">
        Copyright 2024 © Rohan niroula. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
