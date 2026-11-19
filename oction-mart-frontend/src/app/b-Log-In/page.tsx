"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from "../../context/AuthContext";
 // Make sure AuthContext file path is correct
import { LoginRequest } from "@/api/services/auth"; // Your actual LoginRequest type

// --- Styled Components ---
const MainContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #1a1a2e, #1f2b45)",
  color: "#e0e0e0",
});

const LoginCard = styled(Paper)({
  width: "90%",
  maxWidth: "400px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  padding: "2.5rem 2rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  color: "#ffffff",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
});

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    color: "#e0e0e0",
    borderRadius: "8px",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3) !important" },
    "&:hover fieldset": { borderColor: "#4a90e2 !important" },
    "&.Mui-focused fieldset": { borderColor: "#4a90e2 !important" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4a90e2" },
  "& .MuiSvgIcon-root": { color: "#e0e0e0" },
});

const CustomButton = styled(Button)({
  backgroundColor: "#4a90e2",
  color: "white",
  fontWeight: "bold",
  borderRadius: "8px",
  padding: "1rem",
  "&:hover": { backgroundColor: "#3a7bc8" },
  "&.Mui-disabled": {
    backgroundColor: "rgba(74, 144, 226, 0.5)",
    color: "rgba(255, 255, 255, 0.7)"
  }
});

const ModalContainer = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
});

const ModalContent = styled(Paper)({
  width: "90%",
  maxWidth: "400px",
  backgroundColor: "#2a2a47",
  borderRadius: "16px",
  padding: "2rem",
  position: "relative",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

// --- Login Page Component ---
const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, loading, user } = useAuth();

  const [form, setForm] = useState<LoginRequest>({ username: "", password: "", user_type: "buyer" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
  if (isAuthenticated && user) {
    let redirectUrl = "/dashboard";

    switch (user.user_type) {
      case "buyer":
        redirectUrl = "/buyer-launch";
        break;
      case "seller":
        redirectUrl = "/seller-launcher";
        break;
      case "auctioneer":
        redirectUrl = "/auctioneer-dashboard";
        break;
      case "admin":
        redirectUrl = "/admin-dashboard";
        break;
    }

    // Redirect and refresh
    router.replace(redirectUrl); // replaces current history entry
    // OR use window.location.href = redirectUrl; to force full reload
  }
}, [isAuthenticated, user, router]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage({ text: "", isError: false });

    try {
      await login(form);
      setMessage({ text: "Login successful!", isError: false });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail || "Login failed. Please try again.", isError: true });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage({ text: "", isError: false });

    try {
      // Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ text: "If an account with that email exists, a reset link has been sent.", isError: false });
      setShowForgotPassword(false);
    } catch (error) {
      setMessage({ text: "Error sending reset link.", isError: true });
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading || isAuthenticated) {
    return (
      <MainContainer>
        <CircularProgress color="primary" />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <LoginCard>
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center",color:"white", }}>Log in</Typography>
        <form onSubmit={handleLogin}>
          <CustomTextField
            fullWidth
            placeholder="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <PersonOutlineIcon sx={{ mr: 1 }} /> }}
          />
          <CustomTextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <LockOutlinedIcon sx={{ mr: 1 }} />,
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "white" }}>
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              ),
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />}
              label="Remember Me"
              sx={{ color: "#e0e0e0" }}
            />
            <Typography onClick={() => setShowForgotPassword(true)} sx={{ cursor: "pointer", textDecoration: "underline", fontSize: "0.875rem" }}>
              Forgot password?
            </Typography>
          </Box>

          <CustomButton type="submit" fullWidth disabled={loginLoading}>
            {loginLoading ? <CircularProgress size={24} color="inherit" /> : "LOG IN"}
          </CustomButton>
        </form>

        <Link href="/register" style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: '1rem', display: 'block' }}>
          Don't have an account? Register
        </Link>

        {message.text && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: message.isError ? "#ff6b6b" : "#60d394" }}>
              {message.text}
            </Typography>
          </Box>
        )}
      </LoginCard>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ModalContainer>
          <ModalContent>
            <IconButton sx={{ position: "absolute", top: 12, right: 12, color: "white" }} onClick={() => setShowForgotPassword(false)}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>Reset Password</Typography>
            <form onSubmit={handleForgotPasswordSubmit}>
              <CustomTextField
                fullWidth
                label="Email Address"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                type="email"
                sx={{ mb: 2 }}
              />
              <CustomButton type="submit" fullWidth disabled={loginLoading}>
                {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
              </CustomButton>
            </form>
          </ModalContent>
        </ModalContainer>
      )}
    </MainContainer>
  );
};

// Wrap the page with AuthProvider
export default function App() {
  const { AuthProvider } = require('../../context/AuthContext'); // Make sure path is correct
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}