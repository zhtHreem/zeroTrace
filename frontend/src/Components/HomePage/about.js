import React , { forwardRef } from 'react';
import { Box, Typography, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Security, VerifiedUser, Timer, LockPerson, ChevronRight } from '@mui/icons-material';

const AboutPage = forwardRef((props, ref)=> {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const features = [
    { icon: <Security />, text: "Verifiable Response Uniqueness" },
    { icon: <VerifiedUser />, text: "Proof of Human Verification" },
    { icon: <Timer />, text: "Time-Locked Survey Responses" },
    { icon: <LockPerson />, text: "Complete Anonymity and Privacy" }
  ];

  return (
    <Box ref={ref} id="about-section" mr={4} sx={{ background: 'linear-gradient(135deg, #FBF9F1 10%, #FFF8E3 90%)', minHeight: { xs: '100vh', lg: '80vh' }, padding: { xs: 2, sm: 4, md: 6 } }}>
      <Grid mr={4}  container spacing={3} maxWidth="lg" margin="auto">
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ color: '#EF9C66', fontWeight: 700, fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' }, mb: 2, lineHeight: 1.2, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -6, left: 0, width: 40, height: 3, bgcolor: '#EF9C66', borderRadius: 2 } }}>About ZeroTrace</Typography>
            <Typography variant="h6" sx={{ color: '#666', lineHeight: 1.6, mb: 3, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>We are redefining surveys by ensuring complete privacy with Zero-Knowledge Proofs (ZKPs) to maintain both security and integrity.</Typography>
          </Box>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, background:'linear-gradient(135deg, #B7E5B4 0%, #E88B5D 100%)', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3, fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' } }}>Why Choose Us?</Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Paper elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255, 255, 255, 0.7)', borderRadius: 2, transition: '0.2s', '&:hover': { bgcolor: 'rgba(239, 156, 102, 0.1)' } }}>
                    <Box sx={{ bgcolor: '#FFF8E3', p: 0.75, borderRadius: 1.5, display: 'flex' }}>{React.cloneElement(feature.icon, { sx: { fontSize: 20, color: '#EF9C66' } })}</Box>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' } }}>{feature.text}</Typography>
                    <ChevronRight sx={{ color: '#EF9C66', fontSize: 18 }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} sx={{ height: '100%', alignContent: 'center', mt: { xs: 2, md: 0 } }}>
            {features.map((feature, index) => (
              <Grid item xs={6} key={index}>
                <Paper elevation={1} sx={{ p: 2, height: { xs: 120, sm: 140, md: 160 }, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#FFF8E3', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 3 } }}>
                  {React.cloneElement(feature.icon, { sx: { fontSize: { xs: 36, sm: 42, md: 48 }, color: '#EF9C66' } })}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
});

export default AboutPage;
