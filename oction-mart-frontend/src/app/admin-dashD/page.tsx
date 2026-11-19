"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import GavelIcon from '@mui/icons-material/Gavel';

// --- Import the Admin Service and Types ---
// NOTE: Adjust the path to your actual service file
import {
  adminDashboardService,
  AdminDashboardResponse,
  User,
  Auction,
} from "@/api/services/dashboard";

// --- Mocked Authentication/Context (Replace with your actual implementation) ---
const useAuth = () => ({
  // Replace with your actual token retrieval logic
  token: 'YOUR_ADMIN_AUTH_TOKEN_HERE', 
});

// --- Initial States (Zero-value placeholders for loading) ---
const initialAdminStats: AdminDashboardResponse = {
  total_users: 0,
  pending_users: 0,
  approved_users: 0,
  rejected_users: 0,
  user_types: { buyers: 0, sellers: 0, auctioneers: 0 },
  recent_registrations: [],
};
const initialUsers: User[] = [];
const initialAuctions: Auction[] = [];

// Helper to format date strings
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

// Helper for color-coding Chips based on user type/status
const getChipColor = (typeOrStatus: string, isApproved?: boolean) => {
    if (typeOrStatus === 'seller') return { color: 'info', label: 'Seller' };
    if (typeOrStatus === 'auctioneer') return { color: 'secondary', label: 'Auctioneer' };
    if (typeOrStatus === 'buyer') return { color: 'primary', label: 'Buyer' };
    if (isApproved === true || typeOrStatus === 'Approved') return { color: 'success', label: 'Approved' };
    if (isApproved === false || typeOrStatus === 'Rejected') return { color: 'error', label: 'Rejected' };
    if (typeOrStatus === 'Pending') return { color: 'warning', label: 'Pending' };
    if (typeOrStatus === 'Active') return { color: 'success', label: 'Active' };
    if (typeOrStatus === 'Closed') return { color: 'default', label: 'Closed' };
    return { color: 'default', label: typeOrStatus };
}


const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(initialAdminStats);
  // Store the full list of pending users separately for the moderation table
  const [pendingUsers, setPendingUsers] = useState<User[] | null>(initialUsers); 
  const [auctions, setAuctions] = useState<Auction[] | null>(initialAuctions); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUsersList, setPendingUsersList] = useState<User[] | null>(initialUsers); 

  // --- FETCHING LOGIC ---

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminDashboardService.getAdminDashboard(token);
      setStats(data);
      // NOTE: The pending_users count comes from here.
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Failed to load dashboard summary stats.');
    }
  }, [token]);

  // Fetches ALL users and filters them to get the actual list of pending users
  // This is a necessary step to populate the Review table's rows.
  const fetchPendingUsersList = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminDashboardService.getPendingUsers(token);
      if (Array.isArray(data)) {
        // Filter the full list for users with 'Pending' status
        const pending = data.filter(user => user.approval_status === 'Pending');
        setPendingUsers(pending);
      } else {
        console.warn('Received non-array data for all users, defaulting to empty array.', data);
        setPendingUsers(initialUsers); 
      }
    } catch (err) {
      console.error('Error fetching all users for pending list:', err);
      setPendingUsers(initialUsers); 
    }
  }, [token]);
  
  // Fetches Auction data (Mocked in the service file)
  const fetchAuctions = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminDashboardService.getAuctions(token);
      if (Array.isArray(data)) {
        setAuctions(data);
      } else {
        console.warn('Received non-array data for auctions, defaulting to empty array.', data);
        setAuctions(initialAuctions); 
      }
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setAuctions(initialAuctions); 
    }
  }, [token]);

  const loadAllData = useCallback(async () => {
    if (!token) {
      setError("Authentication token missing. Cannot load data.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    await Promise.all([
      fetchDashboardStats(),
      fetchPendingUsersList(), // Fetches the actual list for the table
      fetchAuctions()
    ]);
    setLoading(false);
  }, [token, fetchDashboardStats, fetchPendingUsersList, fetchAuctions]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);


  const handleModeration = async (userId: number, action: 'approve' | 'reject') => {
    if (!token) return;

    try {
      if (action === 'approve') {
        await adminDashboardService.approveUser(userId, token);
      } else {
        await adminDashboardService.rejectUser(userId, token);
      }
      
      // Re-fetch all relevant data after a moderation action
      await fetchDashboardStats();
      await fetchPendingUsersList();
      // Optional: Show success notification (Toast/Snackbar)
    } catch (err) {
      console.error(`User ${action} failed for ID ${userId}:`, err);
      setError(`Failed to ${action} user ID ${userId}. Please try again.`);
      // Optional: Show error notification
    }
  };


  if (loading && stats.total_users === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 4, 
          minHeight: '100vh', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Administrator Dashboard...</Typography>
      </Box>
    );
  }


  // --- END Defensive checks ---


  // Calculate the number of active auctions
  const activeAuctionsCount = Array.isArray(auctions)
    ? auctions.filter(a => a.status === 'Active').length
    : 0;

  // Safely reference pendingUsers as an array
  const safePendingUsersList = Array.isArray(pendingUsers) ? pendingUsers : [];

  // --- MAIN RENDER ---
  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        minHeight: '100vh', 
        bgcolor: 'background.default' 
      }}
    >
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          color: 'primary.main', 
          mb: 1 
        }}
      >
        AuctionMart Admin Panel
      </Typography>
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        sx={{ mb: 4 }}
      >
        Overview of all users, auctions, and pending actions across the platform.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* --------------------------- STATISTICAL CARDS --------------------------- */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        
        {/* Total Users Card (Uses stats.total_users) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4} 
            sx={{ borderLeft: '5px solid', borderColor: 'primary.main' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">TOTAL USERS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total_users}</Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Approved: {stats.approved_users} | Rejected: {stats.rejected_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals Card (Uses stats.pending_users) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4} 
            sx={{ borderLeft: '5px solid', borderColor: 'warning.main' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">PENDING APPROVALS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{stats.pending_users}</Typography>
                </Box>
                <ScheduleSendIcon color="warning" sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Immediate action required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Auction Overview Card (Uses safeAuctions) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={4} 
            sx={{ borderLeft: '5px solid', borderColor: 'info.main' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">TOTAL AUCTIONS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{fetchAuctions.length}</Typography>
                </Box>
                <GavelIcon color="info" sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {activeAuctionsCount} Active Auctions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* User Breakdown Card (Uses stats.user_types) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={{ bgcolor: 'grey.100' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>USER BREAKDOWN</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}><Chip label={`Buyers: ${stats.user_types.buyers}`} color="primary" size="small" variant="outlined" sx={{ mr: 1, mb: 0.5 }} /></Grid>
                <Grid item xs={12}><Chip label={`Sellers: ${stats.user_types.sellers}`} color="info" size="small" variant="outlined" sx={{ mr: 1, mb: 0.5 }} /></Grid>
                <Grid item xs={12}><Chip label={`Auctioneers: ${stats.user_types.auctioneers}`} color="secondary" size="small" variant="outlined" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
     {/* --------------------------- PENDING USER MODERATION --------------------------- */}
<Box sx={{ mb: 5 }}>
  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
    User Registration Review ({stats.pending_users} Pending)
  </Typography>
  
  {/* Check if pendingUsersList is an array and if it has zero length */}
  {(Array.isArray(pendingUsersList) && pendingUsersList.length === 0) ? (
    <Alert severity="success" variant="outlined">
      <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
      All new users have been reviewed. No immediate action required.
    </Alert>
  ) : (
    <TableContainer component={Paper} elevation={3}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.200' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>User Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Registration Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Map directly over the state variable after checking it is an array */}
          {Array.isArray(pendingUsersList) && pendingUsersList.map((user) => (
            <TableRow 
              key={user.id} 
              hover 
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{user.username}</TableCell>
              <TableCell>
                <Chip 
                  label={getChipColor(user.user_type).label} 
                  color={getChipColor(user.user_type).color as 'primary' | 'secondary' | 'info'} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleModeration(user.id, 'approve')}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => handleModeration(user.id, 'reject')}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {/* Add a fallback loading/error state if pendingUsersList is not an array (e.g., null during initial load) */}
          {!Array.isArray(pendingUsersList) && (
             <TableRow><TableCell colSpan={4} align="center">Loading pending users...</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</Box>

      {/* --------------------------- RECENT DATA OVERVIEW --------------------------- */}
      <Grid container spacing={4}>
        
        {/* Recent Registrations Table (Uses stats.recent_registrations) */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Latest Registrations
          </Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.200' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Registered On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Ensure stats.recent_registrations is treated as an array */}
                {(stats.recent_registrations ?? initialUsers).slice(0, 5).map((reg) => (
                  <TableRow key={reg.id} hover>
                    <TableCell>{reg.username}</TableCell>
                    <TableCell>
                       <Chip 
                          label={getChipColor(reg.user_type).label} 
                          color={getChipColor(reg.user_type).color as 'primary' | 'secondary' | 'info'} 
                          size="small" 
                       />
                    </TableCell>
                    <TableCell>{formatDate(reg.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 1, textAlign: 'right' }}>
              <Button size="small" variant="text" color="primary">View All Users...</Button>
            </Box>
          </TableContainer>
        </Grid>

        {/* Auction Overview Table (Uses safeAuctions) */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Auctions Overview
          </Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.200' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Seller</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Using the safe array for mapping */}
                {(Array.isArray(auctions) ? auctions.slice(0, 5) : []).map((auction) => (
                  <TableRow key={auction.id} hover>
                    <TableCell>{auction.item_name}</TableCell>
                    <TableCell>{auction.seller}</TableCell>
                    <TableCell>
                      <Chip 
                          label={getChipColor(auction.status).label} 
                          color={getChipColor(auction.status).color as 'success' | 'default'} 
                          size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 1, textAlign: 'right' }}>
              <Button size="small" variant="text" color="primary">View All Auctions...</Button>
            </Box>
          </TableContainer>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default AdminDashboard;