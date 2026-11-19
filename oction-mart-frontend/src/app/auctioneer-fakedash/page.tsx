"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import CameraIcon from "@mui/icons-material/Camera";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BookIcon from "@mui/icons-material/Book";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

/* -------------------------
    MOCK IMPLEMENTATIONS
    The original file had external imports that caused a compilation error.
    These mock versions provide the necessary functionality to make the component runnable.
   ------------------------- */

// Mock User Authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a successful login with a static user ID
    const mockUser = { id: 1, email: 'auctioneer@example.com' };
    setUser(mockUser);
    setLoading(false);
  }, []);

  return { user, loading };
};

// Mock API Service Types
type AuctionItem = {
  id: number;
  title: string;
  sellerId: string;
  approval_status: string;
  description: string;
  auctionStartTime: string;
  auctionEndTime: string;
  assigned_auctioneer: number;
};

// Mock API Service Functions
const fetchAssignedItems = async (): Promise<AuctionItem[]> => {
  // Simulate API call delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'Vintage Watch', sellerId: 'seller_101', approval_status: 'Pending Review', description: 'A classic timepiece from the 1960s.', auctionStartTime: '2025-09-15T10:00:00Z', auctionEndTime: '2025-09-20T10:00:00Z', assigned_auctioneer: 1 },
        { id: 2, title: 'Antique Desk', sellerId: 'seller_102', approval_status: 'Approved', description: 'Hand-carved solid oak desk.', auctionStartTime: '2025-09-16T12:00:00Z', auctionEndTime: '2025-09-21T12:00:00Z', assigned_auctioneer: 1 },
        { id: 3, title: 'Signed Baseball', sellerId: 'seller_101', approval_status: 'Rejected', description: 'Signed by a legendary player.', auctionStartTime: '2025-09-17T08:00:00Z', auctionEndTime: '2025-09-22T08:00:00Z', assigned_auctioneer: 2 },
      ]);
    }, 500);
  });
};

const approveAuctionItem = async (itemId: number) => {
  console.log(`Approving item ${itemId}`);
  return new Promise(resolve => setTimeout(resolve, 500));
};

const rejectAuctionItem = async (itemId: number, reason: string) => {
  console.log(`Rejecting item ${itemId} with reason: ${reason}`);
  return new Promise(resolve => setTimeout(resolve, 500));
};

/* -------------------------
    Shared style / helpers
    ------------------------- */

const cardContentSx = { p: 3 }; // p:3 -> ~24px
const auctionCardContentSx = { p: 2 }; // inner auction card content
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
  switch (status) {
    case "Live":
      return "success";
    case "Upcoming":
      return "primary";
    case "Completed":
      return "default";
    default:
      return "default";
  }
};

const getItemStatusColor = (status: string) => {
    switch (status) {
        case "Pending Review":
            return "#9c27b0";
        case "Approved":
            return "#2e7d32";
        case "Rejected":
            return "#d32f2f";
        default:
            return "text.secondary";
    }
};

/* -------------------------
    Mock data (replace with real)
    ------------------------- */
const mockStats = [
  { label: "Total Auctions", value: 128, color: "#1976d2", trend: "+8%", icon: <GavelIcon /> },
  { label: "Active Bids", value: 43, color: "#2e7d32", trend: "+4.2%", icon: <MonetizationOnIcon /> },
  { label: "Participants", value: 769, color: "#9c27b0", trend: "+2.1%", icon: <PeopleIcon /> },
  { label: "Revenue", value: "$24.5k", color: "#ed6c02", trend: "+12%", icon: <TrendingUpIcon /> }
];

const mockLicense = {
  status: "Active",
  type: "Auctioneer Pro",
  licenseNumber: "AU-2024-0012",
  issuedDate: "2024-03-04",
  expiry: "2026-03-04",
  renewalFee: "$120"
};

const mockNotifications = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? "bid" : i % 3 === 1 ? "reminder" : "license",
  message: i % 3 === 0 ? `New bid #${i + 1} placed` : i % 3 === 1 ? `Reminder: Auction #${i + 1}` : `License update #${i + 1}`,
  time: `${i + 1}h ago`
}));

const mockAuctions = [
  { id: 1, title: "Antique Vase", image: "/images/vase.jpg", status: "Live", category: "Antiques", currentBid: "$320", bids: 12, participants: 8, endTime: "in 2h" },
  { id: 2, title: "Vintage Watch", image: "/images/watch.jpg", status: "Upcoming", category: "Watches", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 10" },
  { id: 3, title: "Signed Jersey", image: "/images/jersey.jpg", status: "Completed", category: "Sports Memorabilia", currentBid: "$1,200", bids: 18, participants: 14, endTime: "Closed" },
  { id: 4, title: "Retro Radio", image: "/images/radio.jpg", status: "Live", category: "Electronics", currentBid: "$85", bids: 5, participants: 4, endTime: "in 3h" },
  { id: 5, title: "Oil Painting", image: "/images/painting.jpg", status: "Upcoming", category: "Art", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 20" },
  { id: 6, title: "Vintage Camera", image: "/images/camera.jpg", status: "Completed", category: "Photography", currentBid: "$520", bids: 22, participants: 16, endTime: "Closed" },
  { id: 7, title: "Rare Book", image: "/images/book.jpg", status: "Live", category: "Books", currentBid: "$75", bids: 3, participants: 2, endTime: "in 1h" },
  { id: 8, title: "Porcelain Bowl", image: "/images/bowl.jpg", status: "Upcoming", category: "Antiques", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 25" },
];


/* -------------------------
    Dashboard component
    ------------------------- */

export default function Dashboard() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDark);
  const { user, loading: authLoading } = useAuth();

  // header view state: "dashboard" or "reviewSeller"
  const [view, setView] = useState<"dashboard" | "reviewSeller">("dashboard");

  // Auctions search + pagination
  const [auctionQuery, setAuctionQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  // Review Seller state
  const [reviewItems, setReviewItems] = useState<AuctionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [itemToReject, setItemToReject] = useState<number | null>(null);


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

  // Auctions interactions
  const handleViewAuction = (auction: any) => console.log("View", auction);
  const handleCloseAuction = (id: number | string) => console.log("Close", id);

  // Filter auctions by search query (title or category)
  const filteredAuctions = mockAuctions.filter(a =>
    (a.title + " " + a.category).toLowerCase().includes(auctionQuery.toLowerCase())
  );

  const pagedAuctions = filteredAuctions.slice(page * pageSize, (page + 1) * pageSize);

  const canPrev = page > 0;
  const canNext = (page + 1) * pageSize < filteredAuctions.length;

  // Reset page when query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuctionQuery(e.target.value);
    setPage(0);
  };


    // === New State for Modal and Selected Item ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Utility function to format date for datetime-local input
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // === New Handlers for Modal Logic ===
    const handleViewItemDetails = (item: any) => {
      setSelectedItem({
        ...item,
        auctionStartTime: formatDateForInput(item.auctionStartTime),
        auctionEndTime: formatDateForInput(item.auctionEndTime),
      });
      setIsModalOpen(true);
    };

    const handleUpdateItem = async (updatedDetails: any) => {
      if (!selectedItem) return;
      setActionLoading(selectedItem.id);
      try {
        // Mock API call to update the item
        console.log(`Updating item ${selectedItem.id} with new details:`, updatedDetails);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        // Update the local state to reflect the change
        setReviewItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id ? { ...item, ...updatedDetails } : item
          )
        );
        setIsModalOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error("Failed to update item:", error);
      } finally {
        setActionLoading(null);
      }
    };
    
    // === Item Review interactions ===
    const handleApproveItem = async (itemId: number) => {
      setActionLoading(itemId);
      try {
        await approveAuctionItem(itemId);
        setReviewItems(
          reviewItems.map((item) =>
            item.id === itemId
              ? { ...item, approval_status: "Approved" }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to approve item:", err);
      } finally {
        setActionLoading(null);
      }
    };

    const handleRejectItem = (itemId: number) => {
      setItemToReject(itemId);
      setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
      if (!itemToReject) return;
      setActionLoading(itemToReject);
      try {
        await rejectAuctionItem(itemToReject, rejectionReason);
        setReviewItems(
          reviewItems.map((item) =>
            item.id === itemToReject
              ? { ...item, approval_status: "Rejected" }
              : item
          )
        );
        setIsRejectModalOpen(false);
        setRejectionReason("");
        setItemToReject(null);
      } catch (err) {
        console.error("Failed to reject item:", err);
      } finally {
        setActionLoading(null);
      }
    };
    
    // === Modal Component for Editing Details ===
    const EditItemModal = ({ item, onClose, onSave }) => {
      const [formData, setFormData] = useState({
        title: item.title,
        description: item.description,
        auctionStartTime: item.auctionStartTime,
        auctionEndTime: item.auctionEndTime,
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
      };

      if (!item) return null;

      return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
          <DialogTitle>Edit Auction Item</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="auctionStartTime"
                label="Auction Start Time"
                type="datetime-local"
                name="auctionStartTime"
                value={formData.auctionStartTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="auctionEndTime"
                label="Auction End Time"
                type="datetime-local"
                name="auctionEndTime"
                value={formData.auctionEndTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      );
    };


  /* -------------------------
      Fetch Pending Items
  ------------------------- */
  useEffect(() => {
    const fetchItems = async () => {
      if (!authLoading && user) {
        setLoading(true);
        try {
          const data = await fetchAssignedItems();
          // ✅ only show items assigned to this auctioneer
          const filtered = user?.id
            ? data.filter(
                (item) => item.assigned_auctioneer === user.id
              )
            : data;
          setReviewItems(filtered);
        } catch (err) {
          console.error("Failed to fetch items for review:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItems();
  }, [authLoading, user]);


  const filteredReviewItems = useMemo(() => {
    return reviewItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sellerId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Statuses' || item.approval_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reviewItems, searchTerm, statusFilter]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#121212' : '#e0f7fa'} 0%, ${theme.palette.mode === 'dark' ? '#1c1c1c' : '#ffffff'} 100%)`
      }}>
        <Box sx={{
          p: { xs: 2, sm: 4, md: 6 },
          maxWidth: 'lg',
          mx: 'auto'
        }}>
          {/* Main header */}
          <Grid container alignItems="center" justifyContent="space-between" mb={4}>
            <Grid item>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Auctioneer Dashboard
                </Typography>
                <Chip
                  avatar={<Avatar><GavelIcon /></Avatar>}
                  label="Auctioneer Pro"
                  color="primary"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant={view === 'dashboard' ? 'contained' : 'text'}
                  onClick={() => setView('dashboard')}
                  startIcon={<GavelIcon />}
                >
                  Dashboard
                </Button>
                <Button
                  variant={view === 'reviewSeller' ? 'contained' : 'text'}
                  onClick={() => setView('reviewSeller')}
                  startIcon={<PeopleIcon />}
                >
                  Review
                </Button>
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  icon={<AccessTimeIcon />}
                  checkedIcon={<CalendarTodayIcon />}
                  color="default"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Conditional Content */}
          {view === 'dashboard' && (
            <Grid container spacing={4}>
              {/* Stats & License */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {mockStats.map((stat) => (
                    <Grid item xs={12} sm={6} key={stat.label}>
                      <Card sx={cardBaseSx}>
                        <CardContent sx={cardContentSx}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle1" color="text.secondary">{stat.label}</Typography>
                            <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                          </Box>
                          <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="body2" color="success.main">{stat.trend}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={cardBaseSx}>
                  <CardContent sx={cardContentSx}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" fontWeight="bold">License Status</Typography>
                      <Chip label={mockLicense.status} color={mockLicense.status === 'Active' ? 'success' : 'error'} size="small" />
                    </Box>
                    <List disablePadding>
                      <ListItem disablePadding>
                        <ListItemText primary="Type" secondary={mockLicense.type} />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText primary="Expiry" secondary={mockLicense.expiry} />
                      </ListItem>
                    </List>
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<EditIcon />}>
                      Manage License
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notifications */}
              <Grid item xs={12} md={6}>
                <Card sx={cardBaseSx}>
                  <CardContent sx={cardContentSx}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Notifications
                      <IconButton sx={{ float: 'right' }}><NotificationsIcon /></IconButton>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {mockNotifications.map(n => (
                        <ListItem key={n.id} disablePadding sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Badge
                              badgeContent={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'red' }} />}
                              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                              overlap="circular"
                            >
                              <Avatar sx={{ bgcolor: n.type === 'bid' ? '#1976d2' : n.type === 'reminder' ? '#ed6c02' : '#2e7d32' }}>
                                {n.type === 'bid' ? <MonetizationOnIcon /> : n.type === 'reminder' ? <AccessTimeIcon /> : <GavelIcon />}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText primary={n.message} secondary={n.time} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Auction Management */}
              <Grid item xs={12} md={6}>
                <Card sx={cardBaseSx}>
                  <CardContent sx={cardContentSx}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      My Auctions
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search auctions..."
                      value={auctionQuery}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    {pagedAuctions.map(auction => (
                      <Card key={auction.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                        <CardContent sx={auctionCardContentSx}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <Box sx={{ width: 60, height: 60, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden' }}>
                                {/* Example: using an icon instead of a placeholder image */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                  {auction.category === "Antiques" ? <BookIcon sx={{ fontSize: 30 }} /> :
                                   auction.category === "Watches" ? <AccessTimeIcon sx={{ fontSize: 30 }} /> :
                                   auction.category === "Sports Memorabilia" ? <DirectionsCarIcon sx={{ fontSize: 30 }} /> :
                                   <CameraIcon sx={{ fontSize: 30 }} />}
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs>
                              <Typography variant="subtitle1" fontWeight="bold">{auction.title}</Typography>
                              <Typography variant="body2" color="text.secondary">Current Bid: {auction.currentBid}</Typography>
                            </Grid>
                            <Grid item>
                              <Chip
                                label={auction.status}
                                color={getStatusChipColor(auction.status)}
                                size="small"
                              />
                            </Grid>
                            <Grid item>
                              <IconButton onClick={() => handleViewAuction(auction)}>
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton onClick={() => handleCloseAuction(auction.id)}>
                                <EditIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        Page {page + 1} of {Math.ceil(filteredAuctions.length / pageSize)}
                      </Typography>
                      <Box>
                        <IconButton onClick={() => setPage(page => page - 1)} disabled={!canPrev}><ArrowBackIosNewIcon /></IconButton>
                        <IconButton onClick={() => setPage(page => page + 1)} disabled={!canNext}><ArrowForwardIosIcon /></IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {view === 'reviewSeller' && (
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card sx={cardBaseSx}>
                  <CardContent sx={cardContentSx}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Review Pending Items
                    </Typography>
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Search by title or seller ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <MenuItem value="All Statuses">All Statuses</MenuItem>
                            <MenuItem value="Pending Review">Pending Review</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {loading ? (
                      <Typography textAlign="center" color="text.secondary">Loading items...</Typography>
                    ) : (
                      <List>
                        {filteredReviewItems.length === 0 ? (
                          <Typography textAlign="center" color="text.secondary">No items found.</Typography>
                        ) : (
                          filteredReviewItems.map(item => (
                            <ListItem
                              key={item.id}
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                mb: 2,
                                borderRadius: 2,
                                '&:last-child': { mb: 0 },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                                    <Chip
                                      label={item.approval_status}
                                      sx={{ bgcolor: getItemStatusColor(item.approval_status), color: 'white' }}
                                      size="small"
                                    />
                                  </Box>
                                }
                                secondary={`Seller ID: ${item.sellerId} | Status: ${item.approval_status}`}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handleViewItemDetails(item)}
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleOutlineIcon />}
                                  onClick={() => handleApproveItem(item.id)}
                                  disabled={actionLoading === item.id || item.approval_status !== 'Pending Review'}
                                >
                                  {actionLoading === item.id ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  startIcon={<HighlightOffIcon />}
                                  onClick={() => handleRejectItem(item.id)}
                                  disabled={actionLoading === item.id || item.approval_status !== 'Pending Review'}
                                >
                                  {actionLoading === item.id ? 'Rejecting...' : 'Reject'}
                                </Button>
                              </Box>
                            </ListItem>
                          ))
                        )}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {/* Render the modal */}
      {isModalOpen && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateItem}
        />
      )}

      {/* Rejection Reason Modal */}
      <Dialog open={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reject Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || actionLoading === itemToReject}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
