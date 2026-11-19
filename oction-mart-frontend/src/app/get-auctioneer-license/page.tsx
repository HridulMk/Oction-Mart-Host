"use client";

import React, { useState } from 'react';

const LICENSE_FEE = 199; // Example fee in USD

const GetAuctioneerLicensePage = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would integrate with a payment gateway and backend
    setSubmitted(true);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7eaea 0%, #e0caca 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '1.25rem',
        boxShadow: '0 8px 32px rgba(138,43,226,0.10)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem' }}>Apply for Auctioneer License</h1>
        <p style={{ color: '#444', marginBottom: '0.5rem', textAlign: 'center' }}>
          Become a licensed auctioneer on Oction Mart and unlock the ability to list and manage auctions. Complete the form below and pay the license fee to apply.
        </p>
        <div style={{
          background: 'linear-gradient(90deg, #8A2BE2 60%, #e0caca 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(138,43,226,0.10)',
        }}>
          License Fee: ${LICENSE_FEE}
        </div>
        {submitted ? (
          <div style={{ color: '#38a169', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center' }}>
            Thank you for your application!<br />Your payment was received and your license request is being processed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="name" style={{ fontWeight: 500, color: '#1a1a2e' }}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontWeight: 500, color: '#1a1a2e' }}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontSize: '1rem',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(90deg, #8A2BE2 60%, #e0caca 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                marginTop: '1rem',
                boxShadow: '0 2px 8px rgba(138,43,226,0.10)',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >
              Pay &amp; Apply
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default GetAuctioneerLicensePage; 