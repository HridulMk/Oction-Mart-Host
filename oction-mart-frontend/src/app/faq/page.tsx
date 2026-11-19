"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is Oction Mart?", a: "Oction Mart is a live auction e-commerce platform where users can bid on products in real-time." },
    { q: "How do I participate in an auction?", a: "Register or log in, browse available auctions, and click 'Join Auction' for any live auction you’re interested in." },
    { q: "What happens if I win an auction?", a: "If you win, the item will appear in your 'Won Items' section with details on completing the purchase." },
    { q: "Is bidding free?", a: "Yes, bidding is completely free. You only pay if you win." },
    { q: "How do I contact support?", a: "You can reach out anytime via the Contact Page or email us at support@octionmart.com." },
    { q: "Can I cancel my bid?", a: "No, once a bid is placed it cannot be canceled. Please bid responsibly." },
    { q: "What payment methods are supported?", a: "We support credit/debit cards, UPI, PayPal, and bank transfers." },
    { q: "Are auctions available internationally?", a: "Yes, Oction Mart is accessible worldwide, but shipping options may vary by region." },
    { q: "How can I sell my items on Oction Mart?", a: "You can register as a seller, list your items, and host auctions directly from your account dashboard." },
    { q: "Is my data secure?", a: "Yes, we use strong encryption and secure payment gateways to protect your data." },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 6,
        minHeight: "100vh",
        // Background with subtle pattern (radial dots + gradient overlay)
        background: `
          radial-gradient(circle at 10% 20%, rgba(56,189,248,0.15) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(139,92,246,0.15) 0%, transparent 25%),
          linear-gradient(135deg, #0f172a, #1e293b)
        `,
        color: "#f8fafc",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 4,
          letterSpacing: 1,
          color: "#f8fafc",
        }}
      >
        ❓ Frequently Asked Questions
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        {faqs.map((faq, index) => (
          <Paper
            key={index}
            elevation={4}
            sx={{
              p: 3,
              borderRadius: "12px",
              backgroundColor: "rgba(30,41,59,0.95)",
              transition: "transform 0.2s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 8px 20px rgba(0,0,0,0.6)",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              onClick={() => toggleFAQ(index)}
              sx={{ cursor: "pointer" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#f8fafc" }}>
                {faq.q}
              </Typography>
              <IconButton>
                {openIndex === index ? (
                  <ExpandLessIcon sx={{ color: "#38bdf8" }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: "#38bdf8" }} />
                )}
              </IconButton>
            </Box>
            <Collapse in={openIndex === index}>
              <Typography
                sx={{
                  mt: 2,
                  color: "#e2e8f0",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {faq.a}
              </Typography>
            </Collapse>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
