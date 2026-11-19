// src/app/pending-users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Container,
  Snackbar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Pagination,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone_number: string;
  street_address: string;
  approval_status: string;
  company_name: string;
  business_name: string;
  business_type: string;
  tax_id: string;
  license_number: string;
  license_issue_date: string;
  license_document: string | null;
  created_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PendingUser[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Auth helpers
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('accessToken');
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// API calls
async function fetchPendingUsers(url: string = '/admin/users/pending/'): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE_URL}${url}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }
  return res.json();
}

async function approveUser(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Approve error ${res.status}: ${text}`);
  }
}

async function rejectUser(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reject error ${res.status}: ${text}`);
  }
}

// Main Component
export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPageUrl, setCurrentPageUrl] = useState('/admin/users/pending/');
  const [apiResponse, setApiResponse] = useState<ApiResponse>({ count: 0, next: null, previous: null, results: [] });
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const itemsPerPage = 10; // Adjust based on API or preference
  const totalPages = Math.ceil(apiResponse.count / itemsPerPage);

  const loadUsers = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPendingUsers(url);
      setApiResponse(data);
      setUsers(data.results);
      setFilteredUsers(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPageUrl);
  }, [currentPageUrl]);

  // Handle filtering and searching
  useEffect(() => {
    let filtered = users;
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter((user) => user.user_type === userTypeFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.business_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [userTypeFilter, searchQuery, users]);

  const handleApprove = async (userId: number, username: string) => {
    try {
      setActionLoading(userId);
      setError(null);
      await approveUser(userId);
      setSuccessMessage(`User ${username} approved successfully`);
      await loadUsers(currentPageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to reject user ${username}?`)) return;
    try {
      setActionLoading(userId);
      setError(null);
      await rejectUser(userId);
      setSuccessMessage(`User ${username} rejected successfully`);
      await loadUsers(currentPageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newUrl = page === 1 ? '/admin/users/pending/' : `/admin/users/pending/?page=${page}`;
    setCurrentPageUrl(newUrl);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
          Manage Pending Users
        </Typography>

        {/* Filter and Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              label="User Type"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="auctioneer">Auctioneer</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search Users"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        {/* Error and Loading States */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            {error.includes('Unauthorized') && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Please ensure you are logged in.</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => (window.location.href = '/login')}
                  sx={{ mt: 1 }}
                >
                  Go to Login
                </Button>
              </Box>
            )}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: '#fff' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Email:</strong> {user.email}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Phone:</strong> {user.phone_number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Business:</strong> {user.business_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>License:</strong> {user.license_number || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Type:</strong> {user.user_type}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(user.id, user.username)}
                        disabled={actionLoading === user.id}
                        sx={{ mr: 1 }}
                      >
                        {actionLoading === user.id ? <CircularProgress size={20} /> : 'Approve'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleReject(user.id, user.username)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? <CircularProgress size={20} /> : 'Reject'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {filteredUsers.length === 0 && (
              <Typography variant="body1" sx={{ mt: 3, textAlign: 'center', color: '#555' }}>
                No pending users found.
              </Typography>
            )}
            {apiResponse.count > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPageUrl.includes('page=') ? parseInt(currentPageUrl.split('page=')[1]) || 1 : 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Success Notification */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
          message={successMessage}
        />
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1976d2', color: '#fff', py: 2, textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}