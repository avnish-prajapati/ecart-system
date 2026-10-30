// ← Login page: send email + password, save the token, go to the right side

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // one function handles every input: the input's "name" decides which field changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the page from reloading
    setError("");
    try {
      const { data } = await api.post("/auth/login", form); // data = { token, role, name }
      login(data);
      navigate(data.role === "admin" ? "/admin" : "/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server");
    }
  };

  return (
    <div className="card form-card">
      <h2>Login</h2>

      {location.state?.message && (
        <p className="success">{location.state.message}</p>
      )}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="btn" type="submit">
          Login
        </button>
      </form>

      <p className="small">
        <Link to="/forgot">Forgot password?</Link> &nbsp;|&nbsp;{" "}
        <Link to="/register">Create account</Link>
      </p>
    </div>
  );
};

export default Login;
