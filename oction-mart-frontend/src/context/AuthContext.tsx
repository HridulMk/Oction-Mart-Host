"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from 'react-hot-toast';
import { authService, LoginRequest, LoginResponse } from "@/api/services/auth";

interface User {
  id: string;
  username: string;
  user_type: "buyer" | "seller" | "auctioneer" | "admin";
  name?: string;
  email?: string;
  approval_status?: string;
  profile_pic: File | string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------
     Initialize Auth on App Load
  ------------------------- */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (accessToken && storedUser) {
          try {
            const profile = await authService.getProfile();
            setUser(profile);
          } catch (error) {
            console.warn("Access token invalid or expired. Logging out.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /* -------------------------
     Login
  ------------------------- */
  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response: LoginResponse = await authService.login(credentials);
      setUser(response.user);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
     Logout
  ------------------------- */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  /* -------------------------
     Register
  ------------------------- */
  const register = async (userData: any) => {
    setLoading(true);
    try {
      await authService.register(userData);
      toast.success('Registration successful! Please log in.');
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Registration failed.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* -------------------------
   Custom Hook
------------------------- */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};