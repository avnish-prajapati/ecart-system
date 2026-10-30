// ← Forgot password in 3 steps on ONE page:
//   step 1: enter email  ->  step 2: enter OTP  ->  step 3: enter new password

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // small helper: run an API call, show errors in one place
  const run = async (callback) => {
    setError("");
    setMessage("");
    try {
      await callback();
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server");
    }
  };

  const sendOtp = (e) => {
    e.preventDefault();
    run(async () => {
      await api.post("/auth/forgot-password", { email });
      setMessage("OTP sent. Check your email (in dev mode, check the backend terminal).");
      setStep(2);
    });
  };

  const checkOtp = (e) => {
    e.preventDefault();
    run(async () => {
      await api.post("/auth/verify-otp", { email, otp });
      setStep(3);
    });
  };

  const changePassword = (e) => {
    e.preventDefault();
    run(async () => {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      navigate("/login", { state: { message: "Password changed. Please log in." } });
    });
  };

  return (
    <div className="card form-card">
      <h2>Forgot password</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {step === 1 && (
        <form onSubmit={sendOtp}>
          <label>Your registered email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn" type="submit">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={checkOtp}>
          <label>6 digit OTP</label>
          <input value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value)} required />
          <button className="btn" type="submit">Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={changePassword}>
          <label>New password (min 6 characters)</label>
          <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <button className="btn" type="submit">Change password</button>
        </form>
      )}

      <p className="small"><Link to="/login">Back to login</Link></p>
    </div>
  );
};

export default ForgotPassword;
