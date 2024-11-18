// Navbar.jsx
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Container, Button, Tooltip, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Assessment } from '@mui/icons-material';
import React, { useState } from 'react';
import {   Paper,Stack } from '@mui/material';
import { Favorite, Instagram, Twitter, LinkedIn, Facebook } from '@mui/icons-material';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pages = ['Home', 'Surveys', 'Create Survey', 'About'];
  const settings = ['Profile', 'Dashboard', 'Settings', 'Logout'];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Assessment sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#C96868' }} />
          <Typography variant="h6" noWrap component="a" href="/" sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontFamily: 'monospace', fontWeight: 700, color: '#C96868', textDecoration: 'none' }}>zeroTrace</Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={(e) => setAnchorElNav(e.currentTarget)} color="inherit" sx={{ color: '#C96868' }}><MenuIcon /></IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)} sx={{ display: { xs: 'block', md: 'none' } }}>
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => setAnchorElNav(null)}><Typography textAlign="center">{page}</Typography></MenuItem>
              ))}
            </Menu>
          </Box>
          <Assessment sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: '#C96868' }} />
          <Typography variant="h5" noWrap component="a" href="/" sx={{ mr: 2, display: { xs: 'flex', md: 'none' }, flexGrow: 1, fontFamily: 'monospace', fontWeight: 700, color: '#C96868', textDecoration: 'none' }}>zeroTrace</Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (
              <Button key={page} onClick={() => setAnchorElNav(null)} sx={{ my: 2, color: '#666666', display: 'block', mx: 2 }}>{page}</Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}><Avatar sx={{ bgcolor: '#C96868' }}>ZT</Avatar></IconButton>
            </Tooltip>
            <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={() => setAnchorElUser(null)}>
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => setAnchorElUser(null)}><Typography textAlign="center">{setting}</Typography></MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Footer.jsx

const Footer = () => {
  return (
    <Paper component="footer" sx={{ mt: 'auto', backgroundColor: '#ffffff', py: 3,marginTop:4, boxShadow: '0px -2px 4px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: '#C96868' }} />
            <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#C96868' }}>zeroTrace</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ color: '#666666' }}>
            <Button color="inherit" size="small">Privacy Policy</Button>
            <Button color="inherit" size="small">Terms of Service</Button>
            <Button color="inherit" size="small">Contact Us</Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, index) => (
              <IconButton key={index} sx={{ color: '#C96868', '&:hover': { color: '#ff1493', transform: 'scale(1.1)', transition: 'all 0.2s' } }}><Icon /></IconButton>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>Made with <Favorite sx={{ color: '#C96868', fontSize: 16, verticalAlign: 'middle' }} /> by zeroTrace © {new Date().getFullYear()}</Typography>
      </Container>
    </Paper>
  );
};

export { Navbar, Footer };