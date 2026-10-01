import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    const loadAppointments = async () => {
      try {
        const [{ user }, { bookings }] = await Promise.all([
          apiRequest("/api/auth/me"),
          apiRequest("/api/bookings"),
        ]);
        if (isCurrent) {
          setAccount(user);
          setAppointments(bookings);
          setLoading(false);
        }
      } catch {
        let saved = [];
        try {
          saved = JSON.parse(
            localStorage.getItem("prescripto-bookings") ?? "[]",
          );
        } catch {
          localStorage.removeItem("prescripto-bookings");
        }
        const results = await Promise.all(
          saved.map(({ id, accessToken }) =>
            apiRequest(`/api/bookings/${encodeURIComponent(id)}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
              .then((result) => result.booking)
              .catch(() => null),
          ),
        );
        if (isCurrent) {
          setAppointments(results.filter(Boolean));
          setLoading(false);
        }
      }
    };
    loadAppointments();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="booking-page appointments-page">
      <div className="appointments-heading">
        <div>
          <p className="booking-eyebrow">Your care</p>
          <h1>
            {account ? `${account.name}'s appointments` : "My Appointments"}
          </h1>
        </div>
        <Link className="appointments-browse" to="/doctors">
          Find a doctor
        </Link>
      </div>
      {loading ? (
        <p className="booking-muted">Loading appointments…</p>
      ) : appointments.length ? (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <article className="appointment-row" key={appointment.id}>
              <div>
                <h2>{appointment.doctorName}</h2>
                <p>
                  {formatDate(appointment.date)} · {appointment.time}
                </p>
                <p className="booking-muted">
                  {appointment.patient.name} · {appointment.patient.email}
                </p>
              </div>
              <div className="appointment-row-meta">
                <strong>${appointment.fee}</strong>
                <span className="appointment-paid">Paid · Confirmed</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="appointments-empty">
          <h2>No appointments yet</h2>
          <p className="booking-muted">
            Completed Stripe test or card payments will appear here on this
            device.
          </p>
          <Link to="/doctors">Browse doctors</Link>
        </section>
      )}
    </main>
  );
};

const formatDate = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default MyAppointments;
