import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

const STORAGE_KEY = "prescripto-bookings";

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const sessionId = searchParams.get("session_id");
  const [error, setError] = useState(() =>
    sessionId ? "" : "No payment session was found.",
  );

  useEffect(() => {
    if (!sessionId) return;

    let isCurrent = true;
    apiRequest(`/api/checkout-session/${encodeURIComponent(sessionId)}`)
      .then((result) => {
        if (!isCurrent) return;
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        const next = saved.filter((item) => item.id !== result.booking.id);
        next.unshift({
          id: result.booking.id,
          accessToken: result.accessToken,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setBooking(result.booking);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      });

    return () => {
      isCurrent = false;
    };
  }, [sessionId]);

  return (
    <main className="booking-page booking-message">
      {booking ? (
        <>
          <span className="booking-confirm-icon" aria-hidden="true">
            ✓
          </span>
          <p className="booking-eyebrow">Payment confirmed</p>
          <h1>Your appointment is booked</h1>
          <p>
            {booking.doctorName} · {formatDate(booking.date)} at {booking.time}
          </p>
          <p className="booking-muted">
            A confirmation has been saved in My Appointments.
          </p>
          <Link
            className="booking-submit booking-inline-link"
            to="/my-appointments"
          >
            View appointment
          </Link>
        </>
      ) : error ? (
        <>
          <h1>We couldn’t confirm your booking</h1>
          <p className="booking-error" role="alert">
            {error}
          </p>
          <Link to="/doctors">Return to doctors</Link>
        </>
      ) : (
        <>
          <h1>Verifying your payment</h1>
          <p className="booking-muted">
            Please wait while Stripe confirms your appointment.
          </p>
        </>
      )}
    </main>
  );
};

const formatDate = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default BookingConfirmation;
