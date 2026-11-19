'use client';

import { useState } from 'react';
import React from 'react';
import { config } from '@/config/environment';

// Main App component for the admin login page.
// It is a self-contained functional component using hooks for state management.
const App = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  // State to hold any error message to display to the user
  const [error, setError] = useState<string | null>(null);
  // State to track if the login request is in progress
  const [isLoading, setIsLoading] = useState(false);

  // Function to show a temporary notification on the screen.
  // This is a direct implementation similar to the user's example.
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Create the main notification element.
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        max-width: 300px;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
          <span>${message}</span>
        </div>
      </div>
    `;

    // Append the notification to the document body.
    document.body.appendChild(notification);

    // Animate the notification into view.
    setTimeout(() => {
      const element = notification.firstElementChild as HTMLElement;
      if (element) element.style.transform = 'translateX(0)';
    }, 100);

    // Set a timeout to remove the notification after 3 seconds.
    setTimeout(() => {
      const element = notification.firstElementChild as HTMLElement;
      if (element) {
        element.style.transform = 'translateX(100%)';
        setTimeout(() => {
          // Remove the element from the DOM after the animation completes.
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  // Handler for form input changes.
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for form submission with API integration.
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    const API_URL = `${config.API_BASE_URL}/auth/login/`;
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          user_type: 'admin',
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid username or password");
      }
  
      const result = await response.json();
  
      // ✅ Check if API returned "token" or "access"
      const token = result.token || result.access;
  
      if (!token) throw new Error("Login failed. No token received.");
  
      // ✅ Save to localStorage or sessionStorage based on rememberMe
      if (formData.rememberMe) {
        localStorage.setItem("authToken", token);
      } else {
        sessionStorage.setItem("authToken", token);
      }
  
      showNotification("Successfully logged in!", "success");
      console.log("Login successful:", result);
  
      // Redirect to admin dashboard
      window.location.href = "/admin-dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Login failed. Try again.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1d152a 0%, #2f2343 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background Animation (optional, but matches the user's example aesthetic) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden'
      }}>
        {/* Floating Shapes */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: `${60 + i * 10}px`,
            height: `${60 + i * 10}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: `${i * 0.5}s`,
            top: `${10 + (i * 10) % 80}%`,
            left: `${5 + (i * 15) % 90}%`
          }} />
        ))}
        {/* Particles */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={`particle-${i}`} style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'particleFloat 8s linear infinite',
            animationDelay: `${i}s`,
            top: `${10 + (i * 10) % 80}%`,
            left: `${20 + (i * 15) % 80}%`
          }} />
        ))}
      </div>

      {/* Login Container */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '500px',
          width: '100%',
          animation: 'fadeInUp 0.6s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '10px'
          }}>
            Admin Login
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Enter your credentials to access the dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} style={{ marginTop: '20px' }}>
          {error && (
            <div style={{ color: '#f44336', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                position: 'absolute',
                left: '15px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px'
              }}>
                👤
              </span>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 45px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: isLoading ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                position: 'absolute',
                left: '15px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px'
              }}>
                🔒
              </span>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 45px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: isLoading ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#8a2be2'
                }}
                disabled={isLoading}
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #6a0dad, #8a2be2)',
              color: 'white',
              fontWeight: '600',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(138, 43, 226, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>{isLoading ? 'Logging in...' : 'Login'}</span>
            {!isLoading && <span>→</span>}
          </button>
        </form>
      </div>
      
      {/* CSS Keyframes for animations, to match the provided style */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30vh) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-60vh) scale(1.4); opacity: 0; }
        }
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default App;
