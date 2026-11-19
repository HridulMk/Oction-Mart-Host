"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const SellPage = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1e1e2f 100%)",
      py: 6,
    }}
  >
    <Container maxWidth="md">
      <Card
        sx={{
          borderRadius: "20px",
          background: "rgba(30,30,47,0.9)",
          boxShadow: "0 8px 32px rgba(138,43,226,0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={3}>
            <Box
              sx={{
                width: 8,
                height: 40,
                borderRadius: "8px",
                background: "linear-gradient(to bottom, #8A2BE2, #4a148c)",
                mr: 2,
              }}
            />
            <Typography variant="h4" fontWeight={800} color="#f5f5f5">
              Sell with Oction Mart
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="grey.400" mb={4}>
            Reach more buyers and maximize your auction success
          </Typography>

          {/* How Selling Works */}
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#9f7aea" }}
              gutterBottom
            >
              How Selling Works
            </Typography>
            <Typography color="grey.300" mb={2}>
              Oction Mart offers two secure, transparent ways to sell your items:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Via Licensed Auctioneers"
                  secondary="Submit product details to an Oction Mart auctioneer. They review, verify, and list your item for auction."
                  primaryTypographyProps={{ color: "#f5f5f5", fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "grey.400" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Direct Listing (Seller License)"
                  secondary="Purchase a Seller Listing License to list and manage your own auctions directly."
                  primaryTypographyProps={{ color: "#f5f5f5", fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "grey.400" }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Seller License */}
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#9f7aea" }}
              gutterBottom
            >
              Get Your Seller License
            </Typography>
            <Typography color="grey.300" mb={2}>
              To become a licensed seller and list your own products, simply:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Apply for a Seller Listing License via your account"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Pay the one-time licensing fee"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Access your seller dashboard to upload, manage, and track auctions"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
            </List>
            <Typography color="grey.400">
              Licensed sellers enjoy full control, real-time bid tracking, and
              direct buyer communication.
            </Typography>
          </Box>

          {/* Why Sell */}
          <Box mb={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#9f7aea" }}
              gutterBottom
            >
              Why Sell with Us?
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Access a large, engaged audience of verified buyers"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Transparent, fair auction process"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Secure payments & streamlined logistics"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Comprehensive seller support"
                  primaryTypographyProps={{ color: "#f5f5f5" }}
                />
              </ListItem>
            </List>
          </Box>

          {/* CTA Button */}
          <Box textAlign="center">
            <Button
              href="/register?role=seller"
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #8A2BE2 60%, #4a148c 100%)",
                color: "white",
                fontWeight: 700,
                fontSize: "1.1rem",
                px: 5,
                py: 2,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(138,43,226,0.4)",
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.07)",
                  background:
                    "linear-gradient(90deg, #7a1fd2 60%, #311b92 100%)",
                },
              }}
            >
              Get Started as a Seller
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

export default SellPage;
