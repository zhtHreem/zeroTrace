import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Shell from './Components/Landing/Chrome';
import Hero from './Components/Landing/Hero';
import Crowd from './Components/Landing/Crowd';
import { Marquee, Features, LiveSurveys, FinalCTA } from './Components/Landing/Sections';

function App() {
  const location = useLocation();

  // support navigating here from other pages and landing on a section
  useEffect(() => {
    const id = location.state?.scrollTo || location.hash.replace('#', '');
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <Shell>
      <Hero />
      <Marquee />
      <Crowd />
      <Features />
      <LiveSurveys />
      <FinalCTA />
    </Shell>
  );
}

export default App;
