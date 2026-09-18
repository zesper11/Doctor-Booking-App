import React from "react";
import { doctors } from "../assets/assets";
import { Link } from "react-router-dom";

const TopDoctors = () => {
  return (
    <section>
      <div>
        <h3 className="text-3xl font-medium leading-tight text-gray-900">
          Find by Speciality
        </h3>
        <p className="mx-auto mt-5 max-w-md text-sm leading-5 text-gray-700">
          Simply browse through our extensive list of trusted doctors, schedule
          your appointment hassle-free.
        </p>
      </div>

      {doctors.slice(0, 10).map((item, i) => (
        <Link key={i} to={`/appointment/${item._id}`}>
          <img src={item.image} alt={`top doctor ${item.name}`} />
          <span className="status-tag">Available</span>
          <p>{item.name}</p>
          <p>{item.speciality}</p>
        </Link>
      ))}
    </section>
  );
};

export default TopDoctors;
