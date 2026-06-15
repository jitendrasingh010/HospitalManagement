import { BASE_URL } from '../config';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = `${BASE_URL}/hospital`;

const Forget = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const postData = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await postData(`${API_URL}/forgetpassword`, {
        email: email.trim()
      });

      if (data.message) {
        localStorage.setItem("resetEmail", email.trim());
        setMessage(data.message);
        setError("");
        setStep(2);
      }

    } catch (err) {
      setError(err.message || "Error");
      setMessage("");
    }

    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await postData(`${API_URL}/verify-otp`, {
        otp,
        email: localStorage.getItem("resetEmail"),
      });

      if (data.message) {
        setMessage(data.message);
        setError("");
        setStep(3);
      }

    } catch (err) {
      setError(err.message || "Invalid OTP");
      setMessage("");
    }

    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await postData(`${API_URL}/resetpassword`, {
        email: localStorage.getItem("resetEmail"),
        otp,
        newPassword: password,
      });

      setMessage(data.message);
      setError("");

      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      localStorage.removeItem("resetEmail");
      navigate("/");

    } catch (err) {
      setError(err.message || "Error");
      setMessage("");
    }

    setLoading(false);
  };

  return (
    <main className="login-page">
      <section className="login-box forget-box">
        <div className="theme-row">
          <button onClick={() => navigate("/")} className="back-btn" type="button">
            Back to login
          </button>
        </div>

        <div className="login-head">
          <div className="login-logo">H</div>
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Forgot Password</h1>
          </div>
        </div>

        <div className="step-row">
          <span className={step >= 1 ? "step active" : "step"}>1</span>
          <span className={step >= 2 ? "step active" : "step"}>2</span>
          <span className={step >= 3 ? "step active" : "step"}>3</span>
        </div>

        {step === 1 && (
          <form onSubmit={sendOTP} className="login-form mt-3">
            <label className="login-field full-width">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={loading} className="full-width mt-3">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOTP} className="login-form mt-3">
            <label className="login-field full-width">
              <span>Verification OTP</span>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </label>

            <button type="submit" disabled={loading} className="full-width mt-3">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="login-form mt-3">
            <label className="login-field full-width">
              <span>New Password</span>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={loading} className="full-width mt-3">
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && <p className="message success-message">{message}</p>}

        {error && <p className="message error-message">{error}</p>}
      </section>
    </main>
  );
};

export default Forget;
