import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <main className="story-page">
      <p className="booking-eyebrow">About Prescripto</p>
      <section className="story-intro">
        <img src={assets.about_image} alt="Doctor speaking with a patient" />
        <div>
          <h1>Care starts with finding the right doctor.</h1>
          <p>
            Prescripto brings trusted specialists and straightforward
            appointment booking together, so arranging a visit feels clear from
            the first search to the confirmed time.
          </p>
          <p>
            Browse doctors by specialty, compare consultation fees, and choose
            an appointment time that works for you.
          </p>
          <Link className="booking-submit story-link" to="/doctors">
            Find a doctor
          </Link>
        </div>
      </section>
      <section className="story-values">
        <h2>What matters in every visit</h2>
        <div className="story-value-list">
          <article>
            <h3>Thoughtful access</h3>
            <p>
              Clear doctor profiles help you make an informed choice about your
              care.
            </p>
          </article>
          <article>
            <h3>Simple scheduling</h3>
            <p>
              Choose a date and available time before securely completing your
              booking.
            </p>
          </article>
          <article>
            <h3>Secure payment</h3>
            <p>
              Card payments are handled by Stripe Checkout, never stored by
              Prescripto.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default About;
