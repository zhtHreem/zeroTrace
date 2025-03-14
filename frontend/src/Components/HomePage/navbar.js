// Navbar.jsx
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, MenuItem, Container, Stack, Paper, Button, Tooltip, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Assessment } from '@mui/icons-material';
import React, { useRef, useState, useEffect } from 'react';
import { Favorite, Instagram, Twitter, LinkedIn, Facebook } from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userid = JSON.parse(localStorage.getItem('uid') || 'null');
  const pages = [{ name: 'Home', path: '/' }, { name: 'Surveys', path: '/surveys' }, { name: 'About', path: '#about' }];
  const settings = user ? [{ name: 'Profile', path: `/user/${userid}` }] : [{ name: 'Login', path: '/' }];

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavigation = (path) => {
    handleCloseNavMenu();
    if (path === '#about') {
      if (location.pathname !== '/') navigate('/', { state: { scrollToAbout: true } });
      else document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else navigate(path);
  };

   const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${credentialResponse.access_token}`,
          },
        });
        const userData = await userInfo.json();

        // Send to your backend
        const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            googleId: userData.sub,
            email: userData.email,
            name: userData.name
          })
        });

        if (!res.ok) {
          const errorDetails = await res.json();
          throw new Error(errorDetails.error || 'Failed to login');
        }

        const data = await res.json();
        localStorage.setItem('uid', JSON.stringify(data.user._id));
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'An error occurred during login');
      }
    },
    onError: () => {
      console.error('Login Failed');
      alert('Login Failed. Please try again.');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Assessment sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#C96868' }} />
          <Typography variant="h6" noWrap onClick={() => handleNavigation('/')} sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontFamily: 'monospace', fontWeight: 700, color: '#C96868', textDecoration: 'none' }}>zeroTrace</Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit" sx={{ color: '#C96868' }}><MenuIcon /></IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu} sx={{ display: { xs: 'block', md: 'none' } }}>
              {pages.map((page) => <MenuItem key={page.name} onClick={() => handleNavigation(page.path)}><Typography textAlign="center">{page.name}</Typography></MenuItem>)}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => <Button key={page.name} onClick={() => handleNavigation(page.path)} sx={{ my: 2, color: '#666666', display: 'block', mx: 2 }}>{page.name}</Button>)}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}><Avatar alt={user?.name || 'User'} src={user?.imageUrl || ''} /></IconButton>
                <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                  {settings.map((setting) => <MenuItem key={setting.name} onClick={setting.name === 'Logout' ? handleLogout : handleCloseUserMenu} component={setting.name !== 'Logout' ? Link : undefined} to={setting.name !== 'Logout' ? setting.path : undefined}><Typography textAlign="center">{setting.name}</Typography></MenuItem>)}
                </Menu>
           <Button onClick={handleLogout} sx={{ ml: 2,  color:"#234A1F",  backgroundColor: "#CFE8B3",   '&:hover': { backgroundColor: "#fff", color: "#18230F" }  }} color="secondary">
            Logout
          </Button>              </>
            ) : (
        <Button   onClick={() => login()}     variant="contained"
          sx={{ ml: 2 ,   backgroundColor:"#18230F", color: "#fff",   '&:hover': { backgroundColor: "#234A1F", color: "#CFE8B3" } }}   >
          Login with Google
        </Button>

           )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Footer.jsx
const Footer = () => (
  <Paper component="footer" sx={{ mt: 'auto', backgroundColor: '#ffffff', py: 3, marginTop: 4, boxShadow: '0px -2px 4px rgba(0,0,0,0.1)' }}>
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
          {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, index) => <IconButton key={index} sx={{ color: '#C96868', '&:hover': { color: '#ff1493', transform: 'scale(1.1)', transition: 'all 0.2s' } }}><Icon /></IconButton>)}
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>Made with <Favorite sx={{ color: '#C96868', fontSize: 16, verticalAlign: 'middle' }} /> by zeroTrace © {new Date().getFullYear()}</Typography>
    </Container>
  </Paper>
);

export { Navbar, Footer };
