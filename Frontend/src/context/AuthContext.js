
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const markProfileAsCreated = () => setProfileCreated(true);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, profileCreated, markProfileAsCreated }}>
      {children}
    </AuthContext.Provider>
  );
};