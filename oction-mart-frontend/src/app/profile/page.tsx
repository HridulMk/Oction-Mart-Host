"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  Box, TextField, Button, Typography, Paper, Avatar,
  IconButton, CircularProgress, styled
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

// --- API Service ---
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      toast.error(error.response.data?.detail || "An unexpected error occurred.");
    } else if (error.request) {
      toast.error("Network error. Please check your internet connection.");
    } else {
      toast.error(`Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

const authService = {
  getProfile: async () => {
    const res = await api.get('/auth/profile/');
    return res.data;
  },
  updateProfile: async (data: FormData) => {
    const res = await api.patch('/auth/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// --- Styled Component ---
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// --- React Component ---
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: ""
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError("User not authenticated. Please log in.");
          return;
        }

        const profile = await authService.getProfile();
        setUser(profile);
        setFormData({
          username: profile.username || "",
          email: profile.email || "",
          first_name: profile.first_name || "",
          last_name: profile.last_name || ""
        });
        if (profile.profile_pic) {
          setPreviewUrl(profile.profile_pic);
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image under 5MB.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (profilePicFile) {
      data.append("profile_pic", profilePicFile);
    }

    try {
      const updatedProfile = await authService.updateProfile(data);
      toast.success("Profile updated successfully!");
      setUser(updatedProfile);
      if (updatedProfile.profile_pic) {
        setPreviewUrl(updatedProfile.profile_pic);
      }
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Typography variant="h6" color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '3rem', backgroundColor: '#f3f4f6' }}>
        <Paper elevation={6} sx={{ padding: '2rem', width: '100%', maxWidth: '500px', borderRadius: '12px' }}>
          <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a202c' }}>My Profile</Typography>
            <Typography variant="body2" sx={{ color: '#4a5568', marginTop: '0.5rem' }}>
              Manage your profile details and information.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
              <IconButton component="label">
                <Avatar
                  src={previewUrl || user.profile_pic || '/placeholder-profile.png'}
                  sx={{ width: 120, height: 120, cursor: 'pointer', border: '3px solid #6366f1' }}
                />
                <PhotoCameraIcon
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    color: 'white',
                    backgroundColor: '#6366f1',
                    borderRadius: '50%',
                    padding: '0.25rem'
                  }}
                />
                <VisuallyHiddenInput type="file" onChange={handleFileChange} accept="image/*" />
              </IconButton>
            </Box>
            {["username", "first_name", "last_name", "email"].map((field) => (
              <TextField
                key={field}
                label={field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                name={field}
                type={field === "email" ? "email" : "text"}
                required={field === "username" || field === "email"}
                fullWidth
                variant="outlined"
                value={formData[field]}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <TextField
                label="User Type"
                value={user.user_type}
                disabled
                fullWidth
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f0f0f0' } }}
              />
              <TextField
                label="Approval Status"
                value={user.approval_status || "pending"}
                disabled
                fullWidth
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f0f0f0' } }}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                marginTop: '1.5rem',
                backgroundColor: '#4338ca',
                '&:hover': { backgroundColor: '#312e81' },
                borderRadius: '8px',
                paddingY: '0.75rem'
  
  }}
>
  Update Profile
</Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};