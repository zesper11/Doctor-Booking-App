import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { readPatientProfile, savePatientProfile } from "../lib/patientProfile";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(readPatientProfile);
  const isSignup = location.pathname === "/signup";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await apiRequest(
        `/api/auth/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify({ ...profile, password }),
        },
      );
      setUser(result.user);
      savePatientProfile({ ...profile, ...result.user });
      navigate(location.state?.from ?? "/doctors");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="patient-page">
      <div className="patient-page-heading">
        <p className="booking-eyebrow">Patient account</p>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p>
          {isSignup
            ? "Save your details and manage appointments."
            : "Sign in to manage your appointments."}
        </p>
      </div>
      <form className="patient-form auth-form" onSubmit={submit}>
        {isSignup && (
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
        )}
        <label className="booking-field">
          Email address
          <input
            autoComplete="email"
            onChange={(event) =>
              setProfile({ ...profile, email: event.target.value })
            }
            required
            type="email"
            value={profile.email}
          />
        </label>
        {isSignup && (
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
        )}
        <label className="booking-field">
          Password
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            maxLength={72}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && (
          <p className="booking-error" role="alert">
            {error}
          </p>
        )}
        <button className="booking-submit" type="submit">
          {submitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Prescripto?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
