import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { doctors } from "../assets/assets";
import { apiRequest } from "../lib/api";
import { readPatientProfile, savePatientProfile } from "../lib/patientProfile";

const Appointment = () => {
  const { docId } = useParams();
  const location = useLocation();
  const doctor = doctors.find((item) => item._id === docId);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDate(tomorrow);
  });
  const [time, setTime] = useState("");
  const [patient, setPatient] = useState(readPatientProfile);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!doctor) {
    return (
      <section className="booking-page booking-message">
        <h1>Doctor not found</h1>
        <Link to="/doctors">Browse available doctors</Link>
      </section>
    );
  }

  const today = localDate(new Date());
  const lastBookableDay = new Date();
  lastBookableDay.setDate(lastBookableDay.getDate() + 90);
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      savePatientProfile(patient);
      const { checkoutUrl } = await apiRequest("/api/checkout-session", {
        method: "POST",
        body: JSON.stringify({ doctorId: doctor._id, date, time, patient }),
      });
      window.location.assign(checkoutUrl);
    } catch (requestError) {
      setError(requestError.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="booking-page">
      <Link className="booking-back-link" to="/doctors">
        ← All doctors
      </Link>
      {new URLSearchParams(location.search).get("checkout") === "cancelled" && (
        <p className="booking-notice" role="status">
          Payment was cancelled. Your appointment has not been booked.
        </p>
      )}
      <div className="booking-layout">
        <section className="booking-doctor-panel">
          <img
            className="booking-doctor-image"
            src={doctor.image}
            alt={doctor.name}
          />
          <p className="booking-eyebrow">{doctor.speciality}</p>
          <h1>{doctor.name}</h1>
          <p className="booking-muted">
            {doctor.degree} · {doctor.experience} experience
          </p>
          <p className="booking-about">{doctor.about}</p>
          <div className="booking-fee-row">
            <span>Consultation fee</span>
            <strong>${doctor.fees}</strong>
          </div>
        </section>

        <form className="booking-form" onSubmit={submitBooking}>
          <div>
            <p className="booking-eyebrow">Appointment</p>
            <h2>Choose a time</h2>
          </div>
          <label className="booking-field">
            Appointment date
            <input
              type="date"
              min={today}
              max={localDate(lastBookableDay)}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
          <fieldset className="booking-field">
            <legend>Available times</legend>
            <div className="booking-time-grid">
              {times.map((slot) => (
                <button
                  aria-pressed={time === slot}
                  className={
                    time === slot ? "booking-time active" : "booking-time"
                  }
                  key={slot}
                  onClick={() => setTime(slot)}
                  type="button"
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
            {!time && (
              <span className="booking-help">Select one appointment time.</span>
            )}
          </fieldset>
          <label className="booking-field">
            Full name
            <input
              autoComplete="name"
              minLength={2}
              maxLength={100}
              onChange={(event) =>
                setPatient({ ...patient, name: event.target.value })
              }
              required
              value={patient.name}
            />
          </label>
          <label className="booking-field">
            Email address
            <input
              autoComplete="email"
              onChange={(event) =>
                setPatient({ ...patient, email: event.target.value })
              }
              required
              type="email"
              value={patient.email}
            />
          </label>
          <label className="booking-field">
            Phone number
            <input
              autoComplete="tel"
              minLength={7}
              maxLength={30}
              onChange={(event) =>
                setPatient({ ...patient, phone: event.target.value })
              }
              required
              type="tel"
              value={patient.phone}
            />
          </label>
          {error && (
            <p className="booking-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="booking-submit"
            disabled={!time || submitting}
            type="submit"
          >
            {submitting
              ? "Connecting to Stripe…"
              : `Continue to secure payment · $${doctor.fees}`}
          </button>
          <p className="booking-help">
            Payment is securely processed by Stripe. Your booking is confirmed
            after payment.
          </p>
        </form>
      </div>
    </main>
  );
};

const localDate = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatTime = (time) =>
  new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

export default Appointment;
