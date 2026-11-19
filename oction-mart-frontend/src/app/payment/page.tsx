"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CreditCard, AccountBalance, AccountBalanceWallet } from '@mui/icons-material';
import PaymentIcon from '@mui/icons-material/Payment';

// Define a type for the payment method to ensure type safety
type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

// Dummy auction data
const auctionDetails = {
  item: "Vintage Watch",
  finalBid: 50000,
  auctionFee: 2500,
  shipping: 500,
  totalPayment: 53000,
};

// Main component
export default function PaymentPage() {
  const [method, setMethod] = useState<PaymentMethod>("card");

  return (
    <Container
      maxWidth="xl"
      sx={{
        bgcolor: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        color: "black",
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          maxWidth: "lg",
          bgcolor: "white",
          borderRadius: 4,
          boxShadow: 3,
          p: 0,
        }}
      >
        {/* Left Side: Payment Methods */}
        <Box
          sx={{
            flex: { xs: "1", md: "0.4" },
            p: 4,
            borderRight: { md: "1px solid #e0e0e0" },
            borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
            bgcolor: "white",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "blue" }}>
            Choose Payment Method
          </Typography>
          <Stack spacing={2} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            <ListItem
              disablePadding
              onClick={() => setMethod("card")}
              sx={{
                borderRadius: 2,
                border: method === "card" ? "2px solid blue" : "2px solid transparent",
                bgcolor: method === "card" ? "#e3f2fd" : "transparent",
                transition: "background-color 0.3s, border-color 0.3s",
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <CreditCard sx={{ mr: 2, color: method === "card" ? "blue" : "black" }} />
                <ListItemText primary="Credit / Debit Card" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              onClick={() => setMethod("upi")}
              sx={{
                borderRadius: 2,
                border: method === "upi" ? "2px solid blue" : "2px solid transparent",
                bgcolor: method === "upi" ? "#e3f2fd" : "transparent",
                transition: "background-color 0.3s, border-color 0.3s",
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <PaymentIcon sx={{ mr: 2, color: method === "upi" ? "blue" : "black" }} />
                <ListItemText primary="UPI" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              onClick={() => setMethod("netbanking")}
              sx={{
                borderRadius: 2,
                border: method === "netbanking" ? "2px solid blue" : "2px solid transparent",
                bgcolor: method === "netbanking" ? "#e3f2fd" : "transparent",
                transition: "background-color 0.3s, border-color 0.3s",
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <AccountBalance sx={{ mr: 2, color: method === "netbanking" ? "blue" : "black" }} />
                <ListItemText primary="Netbanking" />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              onClick={() => setMethod("wallet")}
              sx={{
                borderRadius: 2,
                border: method === "wallet" ? "2px solid blue" : "2px solid transparent",
                bgcolor: method === "wallet" ? "#e3f2fd" : "transparent",
                transition: "background-color 0.3s, border-color 0.3s",
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <AccountBalanceWallet sx={{ mr: 2, color: method === "wallet" ? "blue" : "black" }} />
                <ListItemText primary="Wallets" />
              </ListItemButton>
            </ListItem>
          </Stack>
        </Box>

        {/* Right Side: Details & Summary */}
        <Box sx={{ flex: { xs: "1", md: "0.6" }, p: 4, bgcolor: "white" }}>
          <Box mb={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "blue" }}>
              Payment Summary
            </Typography>
            <Stack spacing={1} sx={{ color: "black" }}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Winning Item</Typography>
                <Typography fontWeight="fontWeightSemiBold">{auctionDetails.item}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Final Bid Amount</Typography>
                <Typography fontWeight="fontWeightSemiBold">₹{auctionDetails.finalBid}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Auction Fee</Typography>
                <Typography fontWeight="fontWeightSemiBold">₹{auctionDetails.auctionFee}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Shipping</Typography>
                <Typography fontWeight="fontWeightSemiBold">₹{auctionDetails.shipping}</Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{
                  borderTop: "1px solid #e0e0e0",
                  pt: 2,
                  mt: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                  Total Payment
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                  ₹{auctionDetails.totalPayment}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Card sx={{ bgcolor: "white", borderRadius: 2, border: "1px solid #e0e0e0", boxShadow: 6 }}>
            <CardContent>
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                {method === "card" && (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                      Pay with Card
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Card Number"
                      InputProps={{
                        sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                      }}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Expiry (MM/YY)"
                        InputProps={{
                          sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="CVV"
                        InputProps={{
                          sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Cardholder Name"
                      InputProps={{
                        sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                      }}
                    />
                  </Stack>
                )}

                {method === "upi" && (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                      Pay with UPI
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      InputProps={{
                        sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                      }}
                    />
                  </Stack>
                )}

                {method === "netbanking" && (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                      Netbanking
                    </Typography>
                    <FormControl fullWidth>
                      <TextField
                        select
                        fullWidth
                        label="Select Bank"
                        variant="outlined"
                        defaultValue=""
                        InputProps={{
                          sx: { bgcolor: "white", color: "black", borderRadius: 2, borderColor: "#e0e0e0" },
                        }}
                        SelectProps={{ native: true }}
                      >
                        <option value="" disabled hidden>Select Bank</option>
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                      </TextField>
                    </FormControl>
                  </Stack>
                )}

                {method === "wallet" && (
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
                      Wallets
                    </Typography>
                    <RadioGroup
                      row
                      aria-labelledby="wallet-radio-buttons-group-label"
                      name="wallet-radio-buttons-group"
                    >
                      <FormControlLabel value="Paytm" control={<Radio sx={{ color: "black" }} />} label="Paytm" />
                      <FormControlLabel value="Amazon Pay" control={<Radio sx={{ color: "black" }} />} label="Amazon Pay" />
                      <FormControlLabel value="Mobikwik" control={<Radio sx={{ color: "black" }} />} label="Mobikwik" />
                    </RadioGroup>
                  </Stack>
                )}
                <Button
                  variant="contained"
                  sx={{
                    mt: 3,
                    py: 2,
                    borderRadius: 2,
                    bgcolor: "blue",
                    "&:hover": {
                      bgcolor: "darkblue",
                    },
                    boxShadow: 3,
                  }}
                >
                  Pay ₹{auctionDetails.totalPayment}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Card>
    </Container>
  );
}