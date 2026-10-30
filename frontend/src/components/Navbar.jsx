// ← top bar. Shows different links for admin, user, or a visitor.

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">E-Cart</Link>

      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.role === "admin" && <Link to="/admin">Manage products</Link>}

        {user?.role === "user" && (
          <>
            <Link to="/shop">Shop</Link>
            <Link to="/cart">My cart</Link>
          </>
        )}

        {user && (
          <>
            <span className="nav-user">{user.name} ({user.role})</span>
            <button className="btn btn-light" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
