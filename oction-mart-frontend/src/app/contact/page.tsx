'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Card } from '@mui/material';

export default function ContactPage() {
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
      <Box sx={{ maxWidth: '900px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        
        {/* Header */}
        <Box textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="h6" sx={{ color: '#aaa', maxWidth: 700, mx: 'auto' }}>
            Have questions or need support? Get in touch with the Oction Mart team—we’re here to help you.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                bgcolor: '#1a1a1a',
                p: 4,
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
                Send Us a Message
              </Typography>

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Your Name"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ style: { color: '#aaa' } }}
                  InputProps={{
                    style: { color: '#fff' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#555' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <TextField
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  fullWidth
                  InputLabelProps={{ style: { color: '#aaa' } }}
                  InputProps={{
                    style: { color: '#fff' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#555' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <TextField
                  label="Message"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={5}
                  InputLabelProps={{ style: { color: '#aaa' } }}
                  InputProps={{
                    style: { color: '#fff' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#555' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#3b82f6',
                    fontWeight: 'bold',
                    py: 1.5,
                    borderRadius: '30px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-3px)' },
                    transition: 'all 0.3s',
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Quick Contact Info */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                bgcolor: '#1a1a1a',
                p: 4,
                borderRadius: 3,
                boxShadow: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 2 }}>
                Quick Support
              </Typography>
              <Box>
                <Typography sx={{ color: '#3b82f6', fontWeight: 'bold' }}>📧 Email</Typography>
                <Typography sx={{ color: '#aaa' }}>support@octionmart.com</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#3b82f6', fontWeight: 'bold' }}>📞 Phone</Typography>
                <Typography sx={{ color: '#aaa' }}>+1 (800) 123-4567</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#3b82f6', fontWeight: 'bold' }}>⏰ Hours</Typography>
                <Typography sx={{ color: '#aaa' }}>Mon - Fri, 9:00 AM - 6:00 PM</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
