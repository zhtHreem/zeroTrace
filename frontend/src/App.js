
import React, { useEffect } from 'react';
import { lazy, Suspense }  from 'react';
import AboutPage from './Components/HomePage/about';
import Header from './Components/HomePage/header';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';
const Navbar = lazy(() => import('./Components/HomePage/navbar').then(module => ({ default: module.Navbar })));
const Footer = lazy(() => import('./Components/HomePage/navbar').then(module => ({ default: module.Footer })));
function App() {
  const location = useLocation();

  
  useEffect(() => {
    // Check if we should scroll to about section
    if (location.state?.scrollToAbout || location.hash === '#about') {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        setTimeout(() => {
          aboutSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100); // Small delay to ensure component is mounted
      }
    }
  }, [location]);
  return (

    <div className="App">
         <Suspense fallback={<Box sx={{ height: '64px' }} />}>
        <Navbar />
      </Suspense>
       <Header/>
       <AboutPage/>
        <Suspense fallback={<Box sx={{ height: '64px' }} />}>
        <Footer />
      </Suspense>
    </div>
   
  );
}

export default App;
