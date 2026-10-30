// ← Register page: creates a normal user (admin is made with "npm run seed")

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      // go to login and pass a small message with it
      navigate("/login", { state: { message: "Registered! Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server");
    }
  };

  return (
    <div className="card form-card">
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password (min 6 characters)</label>
        <input name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />

        <button className="btn" type="submit">Register</button>
      </form>

      <p className="small">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;
