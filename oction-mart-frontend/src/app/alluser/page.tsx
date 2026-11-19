// src/app/alluser/page.tsx
"use client"; // Add this directive to mark as a Client Component

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

// Define the API client directly in the page
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Backend base URL
});

// Reuse the getAllUsers function from dashboard.ts (inlined for clarity)
const getAllUsers = async (token: string, url: string = '/admin/users/all/') => {
  const res = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // returns { count, next, previous, results }
};

export default function UsersPage() {
  const [usersData, setUsersData] = useState({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('/admin/users/all/');

  // Replace with your actual token retrieval logic
  const token = 'your-jwt-token-here'; // Example: Retrieve from localStorage or auth context

  // Function to fetch users
  const fetchUsers = async (url: string) => {
    setLoading(true);
    try {
      const data = await getAllUsers(token, url);
      setUsersData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when URL changes
  useEffect(() => {
    fetchUsers(currentPageUrl);
  }, [currentPageUrl]);

  // Handle pagination
  const handleNextPage = () => {
    if (usersData.next) {
      setCurrentPageUrl(usersData.next.replace('http://127.0.0.1:8000', '')); // Adjust for relative path
    }
  };

  const handlePreviousPage = () => {
    if (usersData.previous) {
      setCurrentPageUrl(usersData.previous.replace('http://127.0.0.1:8000', '')); // Adjust for relative path
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    }}>
      <Typography variant="h4" style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
        All Users
      </Typography>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <CircularProgress />
        </div>
      )}

      {error && (
        <Typography style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#1976d2' }}>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Username</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>First Name</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Last Name</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>User Type</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Address</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Approval Status</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>Business Name</TableCell>
              <TableCell style={{ color: '#fff', fontWeight: 'bold' }}>License Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData.results.map((user: any) => (
              <TableRow key={user.id} style={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.first_name || '-'}</TableCell>
                <TableCell>{user.last_name || '-'}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.street_address}</TableCell>
                <TableCell>{user.approval_status}</TableCell>
                <TableCell>{user.business_name || '-'}</TableCell>
                <TableCell>{user.license_number || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
      }}>
        <Button
          variant="contained"
          disabled={!usersData.previous || loading}
          onClick={handlePreviousPage}
          style={{
            backgroundColor: usersData.previous ? '#1976d2' : '#ccc',
            color: '#fff',
            padding: '10px 20px',
          }}
        >
          Previous
        </Button>
        <Typography style={{ alignSelf: 'center' }}>
          Total Users: {usersData.count}
        </Typography>
        <Button
          variant="contained"
          disabled={!usersData.next || loading}
          onClick={handleNextPage}
          style={{
            backgroundColor: usersData.next ? '#1976d2' : '#ccc',
            color: '#fff',
            padding: '10px 20px',
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}