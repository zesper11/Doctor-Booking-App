import React, { useEffect, useState } from "react";
import { apiRequest } from "./api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    apiRequest("/api/auth/me")
      .then(({ user: account }) => {
        if (isCurrent) setUser(account);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const logout = async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
