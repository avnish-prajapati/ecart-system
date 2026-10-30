// ← remembers WHO is logged in and shares it with every page
// The token and user are also saved in localStorage, so a page refresh does not log you out.

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // start with whatever is saved in localStorage (or null if nobody is logged in)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // called after a successful login: data = { token, role, name }
  const login = (data) => {
    localStorage.setItem("token", data.token);
    const u = { name: data.name, role: data.role };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// small helper so pages can write:  const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
