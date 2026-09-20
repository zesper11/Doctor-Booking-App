import React from "react";
import { doctors } from "../assets/assets";
import { Link } from "react-router-dom";

const TopDoctors = () => {
  return (
    <section className="top-doctors">
      <div className="top-doctors-heading">
        <h3>Top Doctors</h3>
        <p>
          Meet experienced specialists who are ready to provide thoughtful,
          dependable care.
        </p>
      </div>

      <div className="top-doctors-list">
        {doctors.slice(0, 10).map((item, i) => (
          <Link key={i} to={`/appointment/${item._id}`}>
            <img src={item.image} alt={`top doctor ${item.name}`} />
            <span className="status-tag">Available</span>
            <p>{item.name}</p>
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopDoctors;
