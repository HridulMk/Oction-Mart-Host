"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Badge from "@mui/material/Badge";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";

import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { useAuth } from "@/context/AuthContext";
import {
  adminDashboardService,
  User,
} from "@/api/services/dashboard"; // Import from dashboard.ts

/* -------------------------
   Shared style / helpers
   ------------------------- */

const cardContentSx = { p: 3 };
const cardBaseSx = (theme: any) => ({
  borderRadius: 2,
  background:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.95)",
  backdropFilter: "blur(6px)",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
});

const getStatusChipColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const formatApprovalStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Unknown";
  }
};

const getUserTypeIcon = (userType: string) => {
  switch (userType.toLowerCase()) {
    case "buyer":
      return <PeopleIcon />;
    case "seller":
      return <HowToRegIcon />;
    case "auctioneer":
      return <PendingActionsIcon />;
    default:
      return <AccountCircleIcon />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/* -------------------------
   Admin Dashboard component
   ------------------------- */

export default function AdminDashboard() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDark);
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  // States for dashboard data
  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    pending_users: 0,
    approved_users: 0,
    rejected_users: 0,
    user_types: { buyers: 0, sellers: 0, auctioneers: 0 },
    recent_registrations: [],
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search + pagination for pending users
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#1976d2" },
          secondary: { main: "#9c27b0" }
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: "none"
              }
            }
          }
        }
      }),
    [darkMode]
  );

  <Toaster position="top-right" />

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!authLoading) {
        setDashboardLoading(true);
        try {
          const data = await adminDashboardService.getAdminDashboard(token);
          setDashboardData(data);
        } catch (err) {
          console.error("Failed to fetch dashboard:", err);
          setError("Failed to load dashboard data.");
        } finally {
          setDashboardLoading(false);
        }
      }
    };
    fetchDashboard();
  }, [authLoading, token]);

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      if (!authLoading) {
        setPendingLoading(true);
        try {
          const data = await adminDashboardService.getPendingUsers(token);
          // Ensure data is an array
          setPendingUsers(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch pending users:", err);
          setError("Failed to load pending users.");
          setPendingUsers([]);
        } finally {
          setPendingLoading(false);
        }
      }
    };
    fetchPendingUsers();
  }, [authLoading, token]);

  // Approve user
  const handleApproveUser = async (userId: number) => {
    try {
      await adminDashboardService.approveUser(userId, token);
      setPendingUsers(prev => Array.isArray(prev) ? prev.filter(u => u.id !== userId) : []);
      // Refresh dashboard stats
      const data = await adminDashboardService.getAdminDashboard(token);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to approve user:", err);
    }
  };

  // Reject user
  const handleRejectUser = async (userId: number) => {
    try {
      await adminDashboardService.rejectUser(userId, token);
      setPendingUsers(prev => Array.isArray(prev) ? prev.filter(u => u.id !== userId) : []);
      // Refresh dashboard stats
      const data = await adminDashboardService.getAdminDashboard(token);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to reject user:", err);
    }
  };

  // Filter pending users
  const filteredPendingUsers = useMemo(() => {
    return Array.isArray(pendingUsers) ? pendingUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  }, [pendingUsers, searchTerm]);

  const pagedPendingUsers = filteredPendingUsers.slice(page * pageSize, (page + 1) * pageSize);
  const canPrev = page > 0;
  const canNext = (page + 1) * pageSize < filteredPendingUsers.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  if (dashboardLoading || pendingLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        {/* Top header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" color="textPrimary"  sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users, view stats and recent registrations
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <IconButton>
              <Badge badgeContent={dashboardData.pending_users} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">{darkMode ? "Dark" : "Light"}</Typography>
              <Switch checked={darkMode} onChange={() => setDarkMode((s) => !s)} />
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={11} justifyContent="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                      {dashboardData.total_users}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total Users
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#1976d215", borderRadius: 2, p: 1.5 }}>
                    <PeopleIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3} >
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#ed6c02", mb: 1 }}>
                      {dashboardData.pending_users}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Pending
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#ed6c0215", borderRadius: 2, p: 1.5 }}>
                    <PendingActionsIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                      {dashboardData.approved_users}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Approved
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#2e7d3215", borderRadius: 2, p: 1.5 }}>
                    <CheckCircleIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#d32f2f", mb: 1 }}>
                      {dashboardData.rejected_users}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Rejected
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#d32f2f15", borderRadius: 2, p: 1.5 }}>
                    <HighlightOffIcon />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Types Breakdown */}
        <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center" >
          <Grid item xs={12} md={4}>
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Typography variant="h6" color="textPrimary"  sx={{ fontWeight: 600, mb: 2 }}>
                  User Types
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Chip label={`Buyers: ${dashboardData.user_types.buyers}`} color="primary" />
                  <Chip label={`Sellers: ${dashboardData.user_types.sellers}`} color="secondary" />
                  <Chip label={`Auctioneers: ${dashboardData.user_types.auctioneers}`} color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Registrations */}
          <Grid item xs={120} md={8}>
            <Card sx={(t) => ({ ...cardBaseSx(t) })}>
              <CardContent sx={cardContentSx}>
                <Typography variant="h6" color="textPrimary"  sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon /> Recent Registrations
                </Typography>
                <List sx={{ p: 0, maxHeight: 300, minWidth:500, overflow: "auto" }}>
                  {dashboardData.recent_registrations.map((reg) => (
                    <React.Fragment key={reg.id}>
                      <ListItem sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {getUserTypeIcon(reg.user_type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={reg.username}
                          secondary={`${reg.user_type} • ${formatDate(reg.created_at)}`}
                          primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {dashboardData.recent_registrations.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                      No recent registrations.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button variant="contained" color="primary" onClick={() => router.push(`/pendinguser`)}  sx={{ mb: 3, textTransform: "none" }}>
          Manage Pending Users
        </Button>
        {/* New: Support User Chat Button */}
        <Grid item xs={12} sm={3}>
                    <Button 
                        
                        variant="contained" 
                        color="success" 
                        size="large"
                        onClick={() => router.push(`/chatadmin/`)}
                    >
                        Support User Chat
                    </Button>
                    </Grid>
        {/* <Button variant="contained" color="primary" onClick={() => router.push(`/alluser`)}  sx={{ mb: 3, textTransform: "none" }}>
          View All Users
        </Button> */}

    
        </Box>    </ThemeProvider>
  );    
}