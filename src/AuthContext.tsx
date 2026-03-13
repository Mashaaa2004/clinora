import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Doctor, Patient } from './types';

interface AuthContextType {
  user: User | null;
  profile: Doctor | Patient | null;
  login: (data: { user: User; profile: any }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Doctor | Patient | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hospital_user');
    const savedProfile = localStorage.getItem('hospital_profile');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const login = (data: { user: User; profile: any }) => {
    setUser(data.user);
    setProfile(data.profile);
    localStorage.setItem('hospital_user', JSON.stringify(data.user));
    localStorage.setItem('hospital_profile', JSON.stringify(data.profile));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('hospital_user');
    localStorage.removeItem('hospital_profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
