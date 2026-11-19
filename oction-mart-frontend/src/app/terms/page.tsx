'use client';
import React from 'react';
import { Typography, Container, Box, Link, List, ListItem } from '@mui/material';

export default function TermsPage() {
  return (
    <Container maxWidth="100%" sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, rgba(138, 43, 226, 0.2) 50%, #1a1a2e 100%)',
        width: '100%',
        padding: '40px 20px',
        color: '#ccc',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',

      }}
    >
      <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
        Terms of Service
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Effective Date:</strong> September 21, 2025
      </Typography>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>1. Acceptance of Terms</Typography>
        <Typography variant="body1">
          By accessing or using Oction Mart, you agree to be bound by these Terms. If you do not agree, please discontinue use of the platform.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>2. User Accounts</Typography>
        <List>
          <ListItem>You must be at least 18 years old to register.</ListItem>
          <ListItem>You are responsible for maintaining the confidentiality of your account credentials.</ListItem>
          <ListItem>Impersonation or use of false information is strictly prohibited.</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>3. Auction Rules</Typography>
        <List>
          <ListItem>All bids are binding and cannot be withdrawn unless permitted by Oction Mart.</ListItem>
          <ListItem>Sellers must provide accurate descriptions and fair starting prices.</ListItem>
          <ListItem>We reserve the right to cancel auctions that violate our policies.</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>4. Fees and Payments</Typography>
        <List>
          <ListItem>Listing and transaction fees may apply.</ListItem>
          <ListItem>Payments are processed securely via third-party gateways.</ListItem>
          <ListItem>Oction Mart is not liable for disputes between buyers and sellers.</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>5. Prohibited Activities</Typography>
        <List>
          <ListItem>No counterfeit, illegal, or stolen items.</ListItem>
          <ListItem>No manipulation of auction outcomes (e.g., shill bidding).</ListItem>
          <ListItem>No bots or automated bidding systems.</ListItem>
          <ListItem>No harassment or fraud.</ListItem>
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>6. Intellectual Property</Typography>
        <Typography variant="body1">
          All content and branding on Oction Mart is owned or licensed. You may not copy or distribute without permission.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>7. Termination</Typography>
        <Typography variant="body1">
          We may suspend or terminate your account for violations without prior notice.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>8. Limitation of Liability</Typography>
        <Typography variant="body1">
          Oction Mart is not responsible for technical issues, data loss, or user disputes.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>9. Privacy</Typography>
        <Typography variant="body1">
          Your data is handled according to our <Link href="/privacy" color="primary">Privacy Policy</Link>.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography  variant="h5" fontWeight="bold" gutterBottom>10. Changes to Terms</Typography>
        <Typography variant="body1">
          We may update these Terms. Continued use implies acceptance of changes.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>11. Contact Us</Typography>
        <Typography variant="body1">
          For questions, email us at <Link href="mailto:support@octionmart.com" color="primary">support@octionmart.com</Link>.
        </Typography>
      </Box>
    </Container>
  );
}