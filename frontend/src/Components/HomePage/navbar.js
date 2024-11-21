// Navbar.jsx
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Container,Stack,Paper, Button, Tooltip, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Assessment } from '@mui/icons-material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Favorite, Instagram, Twitter, LinkedIn, Facebook } from '@mui/icons-material';


import { Link } from 'react-router-dom';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const theme = useTheme(), navigate = useNavigate(), isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = JSON.parse(localStorage.getItem('user'));

  const pages = [{ name: 'Home', path: '/' }, { name: 'Surveys', path: '/surveys' }, { name: 'Create Survey', path: '/create-survey' }, { name: 'About', path: '/about' }];
  const settings = user ? [{ name: 'Profile', path: `/user/${user}` }, { name: 'Logout', path: '/logout' }] : [{ name: 'Login', path: '/login' }];

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Assessment sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#C96868' }} />
          <Typography variant="h6" noWrap component={Link} to="/" sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontFamily: 'monospace', fontWeight: 700, color: '#C96868', textDecoration: 'none' }}>zeroTrace</Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit" sx={{ color: '#C96868' }}><MenuIcon /></IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu} sx={{ display: { xs: 'block', md: 'none' } }}>
              {pages.map((page) => (<MenuItem key={page.name} component={Link} to={page.path} onClick={handleCloseNavMenu}><Typography textAlign="center">{page.name}</Typography></MenuItem>))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (<Button key={page.name} component={Link} to={page.path} sx={{ my: 2, color: '#666666', display: 'block', mx: 2 }}>{page.name}</Button>))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}><Avatar sx={{ bgcolor: '#C96868' }}>ZT</Avatar></IconButton>
                <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                  {settings.map((setting) => (
                    <MenuItem key={setting.name} onClick={setting.name === 'Logout' ? handleLogout : handleCloseUserMenu} component={setting.name !== 'Logout' ? Link : undefined} to={setting.name !== 'Logout' ? setting.path : undefined}>
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (<Button component={Link} to="/login" color="primary">Login</Button>)}
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