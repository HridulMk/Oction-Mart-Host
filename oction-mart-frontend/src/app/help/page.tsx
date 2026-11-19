'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Grid, Card } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function HelpPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: '#0d0d0f',
        color: '#ccc',
        minHeight: '100vh',
        px: { xs: 2, md: 8 },
        py: 8,
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        fontFamily: 'sans-serif',
      }}
    >
      <Box sx={{ maxWidth: '1000px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {/* Hero / Intro */}
        <Box textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            Help Center
          </Typography>
          <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 700, mx: 'auto' }}>
            Need assistance with Oction Mart? Find answers to common questions, learn how to get started, 
            and contact our support team if you need extra help.
          </Typography>
        </Box>

        {/* Getting Started Guide */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 3 }}>
            Getting Started
          </Typography>
          <Grid container spacing={3}>
            {[
              { step: '1️⃣', title: 'Create an Account', desc: 'Sign up easily with your email to access auctions.' },
              { step: '2️⃣', title: 'Browse Auctions', desc: 'Explore live and upcoming auctions with real-time updates.' },
              { step: '3️⃣', title: 'Place Your Bid', desc: 'Join the excitement and bid securely on your favorite items.' },
              { step: '4️⃣', title: 'Win & Checkout', desc: 'If you win, complete your purchase with seamless payments.' },
            ].map((item, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card
                  sx={{
                    bgcolor: '#1a1a1a',
                    p: 3,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#3b82f6', mb: 1 }}>
                    {item.step} {item.title}
                  </Typography>
                  <Typography sx={{ color: '#aaa' }}>{item.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQs */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 3 }}>
            Frequently Asked Questions
          </Typography>

          {[
            {
              q: 'How do I participate in an auction?',
              a: 'Simply sign up, verify your account, and navigate to the "Explore Auctions" page. If an auction is live, you can place bids instantly.',
            },
            {
              q: 'Is my payment information secure?',
              a: 'Yes. Oction Mart uses encrypted payment gateways to ensure your transactions are 100% safe.',
            },
            {
              q: 'What happens if I win an auction?',
              a: 'You will receive a confirmation and can proceed to checkout securely through our integrated payment system.',
            },
            {
              q: 'Can I sell items on Oction Mart?',
              a: 'Yes! Registered sellers can list their items for auction and manage them via the seller dashboard.',
            },
          ].map((item, i) => (
            <Accordion key={i} sx={{ bgcolor: '#1a1a1a', mb: 2, borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}>
                <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: '#aaa' }}>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Contact Support */}
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            Still Need Help?
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaa', mb: 3 }}>
            Our support team is here to assist you with any questions or issues.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#3b82f6',
              fontWeight: 'bold',
              px: 5,
              py: 2,
              borderRadius: '30px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-3px)' },
              transition: 'all 0.3s',
            }}
            href="/contact"
          >
            Contact Support
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
