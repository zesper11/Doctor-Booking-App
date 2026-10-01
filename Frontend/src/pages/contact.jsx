import React, { useState } from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  const [details, setDetails] = useState({ name: "", email: "", message: "" });
  const [prepared, setPrepared] = useState(false);

  const prepareEmail = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(
      `Prescripto enquiry from ${details.name}`,
    );
    const body = encodeURIComponent(
      `${details.message}\n\nReply to: ${details.email}`,
    );
    window.location.href = `mailto:rohanniroula.work@gmail.com?subject=${subject}&body=${body}`;
    setPrepared(true);
  };

  return (
    <main className="story-page">
      <p className="booking-eyebrow">Contact</p>
      <section className="contact-layout">
        <div className="contact-copy">
          <h1>How can we help?</h1>
          <p>
            For appointment questions or general enquiries, send a note to our
            care team.
          </p>
          <img src={assets.contact_image} alt="Care team available to help" />
          <a href="mailto:rohanniroula.work@gmail.com">
            rohanniroula.work@gmail.com
          </a>
          <p>Monday to Saturday · 9:00 AM–6:00 PM</p>
        </div>
        <form className="patient-form contact-form" onSubmit={prepareEmail}>
          <label className="booking-field">
            Your name
            <input
              autoComplete="name"
              onChange={(event) =>
                setDetails({ ...details, name: event.target.value })
              }
              required
              value={details.name}
            />
          </label>
          <label className="booking-field">
            Email address
            <input
              autoComplete="email"
              onChange={(event) =>
                setDetails({ ...details, email: event.target.value })
              }
              required
              type="email"
              value={details.email}
            />
          </label>
          <label className="booking-field">
            Message
            <textarea
              maxLength={2000}
              onChange={(event) =>
                setDetails({ ...details, message: event.target.value })
              }
              required
              rows={6}
              value={details.message}
            />
          </label>
          {prepared && (
            <p className="booking-help" role="status">
              Your email app should open with this message ready to send.
            </p>
          )}
          <button className="booking-submit" type="submit">
            Prepare email
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
