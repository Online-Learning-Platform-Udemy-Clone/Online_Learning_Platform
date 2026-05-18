import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const didCheckAuth = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (didCheckAuth.current) return;
    didCheckAuth.current = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/auth/check-auth", {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setUser(data.payload);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!import.meta.env.DEV) {
          console.error("Auth check failed:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);

    if (userData.role === "STUDENT") navigate("/student/dashboard");
    else if (userData.role === "INSTRUCTOR") navigate("/instructor/dashboard");
    else if (userData.role === "ADMIN") navigate("/admin/dashboard");
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await fetch("/auth/logout", {
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
