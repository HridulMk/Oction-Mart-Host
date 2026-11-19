"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/admin-dashboard", label: "Admin Dashboard" },
  
];

const AdminHeader = () => {
  const { isAuthenticated, user, logout } = useAuth(); // ✅ inside component
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      style={{
        backgroundColor: "rgba(26, 26, 46, 0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#d1d5db",
        padding: "1rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          flexWrap: "nowrap",
        }}
      >
       {/* Logo */}
<Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
  <Image 
    src="/logo2.jpg" 
    alt="Oction Mart Logo" 
    width={38}
    height={38}
    style={{ marginRight: "10px" }} 
  />


  <span
    style={{
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "white",
    }}
  >
    Oction Mart
  </span>
</Link>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "#d1d5db",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  transition: "color 0.3s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Auth Section */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexShrink: 5,
          }}
        >
          {isAuthenticated ? (
            <>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  {user?.profile_pic ? (
  <img
    key={user.profile_pic}
    src={user?.profile_pic ? `${user.profile_pic}` : "pic.png"}
    alt="Profile"
    width={40}
    height={40}
    style={{
      borderRadius: '50%',
      objectFit: 'cover',
      width: 40,
      height: 40,
    }}
  />
) : null}

  <span>{user?.id}</span>
</div>
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color: "white",
                    fontWeight: "light",
                  }}
                >
                  {user?.username} (<span style={{ color:"green",}}>{user?.user_type}</span>)
                </span>
              </div>
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "#1a1a2e",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    borderRadius: "0.25rem",
                    padding: "0.75rem",
                    zIndex: 1001,
                    minWidth: "160px",
                  }}
                >
                  <Link
                    href="/profile"
                    style={{
                      display: "block",
                      padding: "0.5rem 1rem",
                      color: "#d1d5db",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/buyer-analytics-dashboard"
                    style={{
                      display: "block",
                      padding: "0.5rem 1rem",
                      color: "#d1d5db",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      background: "none",
                      border: "none",
                      color: "#FF4C4C",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/buyer-login-app"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  border: "2px solid white",
                  transition: "all 0.3s",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  backgroundColor: "#8A2BE2",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 4px rgba(138, 43, 226, 0.3)",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen((open) => !open)}
            style={{
              color: "white",
              fontSize: "2rem",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: "1rem",
              zIndex: 2001,
            }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}

        {/* Mobile Menu */}
        {isMobile && menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              background: "rgba(26,26,46,0.97)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              padding: "2rem 1rem 1rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              zIndex: 2000,
            }}
          >
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.25rem",
                width: "100%",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: "#d1d5db",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    transition: "color 0.3s",
                    width: "100%",
                    textAlign: "center",
                    padding: "0.5rem 0",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
