import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/authContext";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();

  useEffect(() => {
    let isCurrent = true;
    apiRequest("/api/auth/me")
      .then(({ user }) => {
        if (isCurrent) setProfile(user);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const submitProfile = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      });
      setProfile(result.user);
      setUser(result.user);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="patient-page">
      <div className="patient-page-heading">
        <p className="booking-eyebrow">My profile</p>
        <h1>Patient details</h1>
        <p>Update the details attached to your account.</p>
      </div>
      {profile ? (
        <form className="patient-form" onSubmit={submitProfile}>
          <label className="booking-field">
            Full name
            <input
              autoComplete="name"
              minLength={2}
              maxLength={100}
              onChange={(event) =>
                setProfile({ ...profile, name: event.target.value })
              }
              required
              value={profile.name}
            />
          </label>
          <label className="booking-field">
            Email address
            <input readOnly type="email" value={profile.email} />
          </label>
          <label className="booking-field">
            Phone number
            <input
              autoComplete="tel"
              minLength={7}
              maxLength={30}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.target.value })
              }
              required
              type="tel"
              value={profile.phone}
            />
          </label>
          {saved && (
            <p className="booking-help" role="status">
              Your details have been saved.
            </p>
          )}
          {error && (
            <p className="booking-error" role="alert">
              {error}
            </p>
          )}
          <button className="booking-submit" type="submit">
            Save changes
          </button>
        </form>
      ) : (
        <div className="patient-form">
          <p className="booking-error" role="alert">
            {error || "Sign in to manage your profile."}
          </p>
          <Link to="/login">Log in</Link>
        </div>
      )}
      {profile && (
        <Link className="patient-appointments-link" to="/my-appointments">
          View my appointments
        </Link>
      )}
    </main>
  );
};

export default Profile;
