'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';

export default function AboutPage() {
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
      <Box sx={{ maxWidth: '1200px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Hero Section */}
        <Box textAlign="center">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              color: '#fff',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            About <span style={{ color: '#3b82f6' }}>Oction Mart</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 600, mx: 'auto' }}>
            Empowering the future of digital auctions through innovation, trust, and cutting-edge technology.
          </Typography>
        </Box>

        {/* Mission Section */}
        <Card
          sx={{
            bgcolor: '#1a1a1a',
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            boxShadow: 8,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
              <Typography variant="h3" sx={{ color: '#3b82f6' }}>🚀</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
                Our Mission
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#bbb', lineHeight: 1.8, fontSize: '1.1rem' }}>
              At Oction Mart, we aim to revolutionize the way auctions are conducted online. 
              Our goal is to provide a seamless, secure, and real-time bidding experience 
              for users across the globe. We are committed to enabling smart, fast, 
              and fair transactions in a transparent digital environment.
            </Typography>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <Box>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={4} flexDirection="column" textAlign="center" >
            <Typography variant="h3" sx={{ color: '#3b82f6' }}>✨</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
              What We Offer
            </Typography>
          </Box>
          <Grid container spacing={5}alignContent={"stretch"}>
            {[
              { icon: '✨', color: '#facc15', title: 'Live Auction Participation', desc: 'Join real-time bidding with instant updates on all auctions.' },
              { icon: '🔐', color: '#22c55e', title: 'Secure User Authentication', desc: 'Bid with confidence on a platform that values your security.' },
              { icon: '📊', color: '#a855f7', title: 'Powerful Dashboards', desc: 'Sellers and admins get full control over listings and user data.' },
              { icon: '🤝', color: '#f97316', title: 'Seamless Transactions', desc: 'Integrated payment systems for fast and secure transactions.' },
            ].map((item, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card
                  sx={{
                    bgcolor: '#111',
                    borderRadius: 2,
                    p: 3,
                    height: '100%',
                    boxShadow: 4,
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: 8, transform: 'translateY(-5px)' },
                  }}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: '#fff', mb: 1 }}>
                    <span style={{ color: item.color, marginRight: '10px', fontSize: '1.5rem' }}>{item.icon}</span>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Technologies */}
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 4 }}>
            Built With
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              { icon: '⚛️', tech: 'React' },
              { icon: '⚡', tech: 'Next.js' },
              { icon: '🎨', tech: 'Tailwind CSS' },
              { icon: '✍️', tech: 'TypeScript' },
              { icon: '🔥', tech: 'Firebase' },
              { icon: '🍃', tech: 'MongoDB' },
            ].map((t, i) => (
              <Grid item xs={6} md={2} key={i}>
                <Card
                  sx={{
                    bgcolor: '#1a1a1a',
                    p: 3,
                    border: '1px solid #333',
                    borderRadius: 2,
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                  }}
                >
                  <Typography variant="h4">{t.icon}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#ddd' }}>
                    {t.tech}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            Join the Next Generation of Auctions
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaa', maxWidth: 600, mx: 'auto', mb: 3 }}>
            Ready to explore? Discover live auctions, become a seller, or find your next great item.
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
            href="/explore-auctions"
          >
            Explore Auctions
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
