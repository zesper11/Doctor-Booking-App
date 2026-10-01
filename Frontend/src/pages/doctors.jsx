import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doctors, specialityData } from "../assets/assets";
import "../App.css";
import "../index.css";

const Doctors = () => {
  const { specialty } = useParams();
  return <DoctorsDirectory key={specialty || "all"} specialty={specialty} />;
};

const DoctorsDirectory = ({ specialty }) => {
  const [category, setCategory] = useState(specialty || false);
  const categories = specialityData.map((item) => item.speciality);
  const filteredDoctors = category
    ? doctors.filter((doctor) => doctor.speciality === category)
    : doctors;

  return (
    <div className="doctors-page">
      <aside className="doctors-filter">
        <h3>Specialities</h3>
        <button
          className={
            !category ? "doctor-filter-btn active" : "doctor-filter-btn"
          }
          onClick={() => setCategory(false)}
        >
          All doctors
        </button>
        {categories.map((item) => (
          <button
            key={item}
            className={
              category === item
                ? "doctor-filter-btn active"
                : "doctor-filter-btn"
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <div className="doctors-list">
        {filteredDoctors.length ? (
          filteredDoctors.map((item) => (
            <Link
              key={item._id}
              to={`/appointment/${item._id}`}
              className="doctor-card"
            >
              <img src={item.image} alt={`doctor ${item.name}`} />
              <span className="status-tag">Available</span>
              <div className="doctor-card-info">
                <p>{item.name}</p>
                <p>{item.speciality}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="doctor-empty-state">
            <p>No doctors are listed for {category} yet.</p>
            <button
              className="doctor-filter-btn"
              onClick={() => setCategory(false)}
            >
              View all doctors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
