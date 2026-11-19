"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/system";
import api from "@/api"; // ✅ Axios instance with JWT interceptors
import styles from "@/styles/pages/items.module.css";

// --- Dark Theme ---
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#BB86FC" },
    secondary: { main: "#03DAC6" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#E0E0E0", secondary: "#A0A0A0" },
  },
  typography: {
    fontFamily: ['"Inter"', "sans-serif"].join(","),
    h5: { fontWeight: 600, color: "#E0E0E0" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          "&.MuiButton-containedPrimary": {
            backgroundColor: "#BB86FC",
            color: "#121212",
            "&:hover": { backgroundColor: "#A775F0" },
          },
          "&.MuiButton-outlined": {
            borderColor: "#404040",
            color: "#BB86FC",
            "&:hover": {
              borderColor: "#BB86FC",
              backgroundColor: "rgba(187, 134, 252, 0.08)",
            },
          },
        },
      },
    },
  },
});

// --- Styled Components ---
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "700px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState({
    auction_start: "",
    auction_end: "",
    title: "",
    description: "",
    start_price: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Utility function
  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // ✅ Fetch item using JWT-protected API
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/auctions/review/${id}/`);
        const fetchedItem = {
          ...res.data,
          auction_start: res.data.auction_start
            ? new Date(res.data.auction_start).toISOString().slice(0, 16)
            : "",
          auction_end: res.data.auction_end
            ? new Date(res.data.auction_end).toISOString().slice(0, 16)
            : "",
        };
        setItem(fetchedItem);
      } catch (err: any) {
        console.error("Failed to fetch item:", err);
        setError(err.response?.data?.detail || "Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // ✅ Save with JWT authentication
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...item,
        auction_start: isValidDate(item.auction_start)
          ? new Date(item.auction_start).toISOString()
          : null,
        auction_end: isValidDate(item.auction_end)
          ? new Date(item.auction_end).toISOString()
          : null,
      };

      const response = await api.patch(`/auctions/review/${id}/`, payload);

      if (response.status === 200 || response.status === 204) {
        setSuccess("Item updated successfully!");
        setTimeout(() => {
          router.push("/auctioneerdashboard");
        }, 1500);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An unknown error occurred.";
      console.error("Failed to update item:", message);
      setError(`Failed to update item: ${message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <StyledContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress color="primary" />
            <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
              Loading item details...
            </Typography>
          </Box>
        </StyledContainer>
      </ThemeProvider>
    );
  }

  // Error handling
  if (error && !item) {
    return (
      <ThemeProvider theme={darkTheme}>
        <StyledContainer>
          <StyledPaper elevation={3}>
            <Alert severity="error">{error}</Alert>
            <Button variant="outlined" onClick={() => router.back()}>
              Go Back
            </Button>
          </StyledPaper>
        </StyledContainer>
      </ThemeProvider>
    );
  }

  // Main form
  return (
    <ThemeProvider theme={darkTheme}>
      <StyledContainer>
        <StyledPaper elevation={3} className={styles.card}>
          <Typography variant="h5" component="h1" gutterBottom>
            Edit Auction Item
          </Typography>

          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Title"
            value={item.title || ""}
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Description"
            value={item.description || ""}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Starting Bid"
            type="number"
            value={item.start_price || ""}
            onChange={(e) =>
              setItem({ ...item, start_price: parseFloat(e.target.value) })
            }
            margin="normal"
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Auction Start Time"
            value={item.auction_start || ""}
            onChange={(e) => setItem({ ...item, auction_start: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Auction End Time"
            value={item.auction_end || ""}
            onChange={(e) => setItem({ ...item, auction_end: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />

          <Box
            sx={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </StyledPaper>
      </StyledContainer>
    </ThemeProvider>
  );
}
