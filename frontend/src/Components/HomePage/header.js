import React, { lazy, Suspense } from 'react';
import { Grid, Typography, Box, Button, keyframes, useMediaQuery, useTheme } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import skyImage from './images/sky.png';
import flowerImage from './images/flower.png';
import bulbImage from './images/bulb.png';
import notebookImage from './images/notebook-and-pencil-hand-drawn-writing-tools.png';
import pencilImage from './images/pencil.png';
import managerImage from './images/manager.png';
import kittenImage from './images/kitten.png';
import handImage from './images/hand.png';
import summerImage from './images/summer.png';
import zIndex from '@mui/material/styles/zIndex';

const Card = lazy(() => import('./Cardform/card'));

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;


const grassStyle = (color, zIndex) => ({
  content: '""',
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "65px",
  background: color,
  clipPath: "polygon(0% 30%, 3% 0%, 6% 30%, 9% 0%, 12% 30%, 15% 0%, 18% 30%, 21% 0%, 24% 30%, 27% 0%, 30% 30%, 33% 0%, 36% 30%, 39% 0%, 42% 30%, 45% 0%, 48% 30%, 51% 0%, 54% 30%, 57% 0%, 60% 30%, 63% 0%, 66% 30%, 69% 0%, 72% 30%, 75% 0%, 78% 30%, 81% 0%, 84% 30%, 87% 0%, 90% 30%, 93% 0%, 96% 30%, 100% 0%, 100% 100%, 0% 100%)",
  zIndex
});

const ImageComponent = React.memo(({ src, ...props }) => (
  <Box
    component="img"
    src={src}
    loading="lazy"
    {...props}
  />
));

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getMobileImageProps = (originalProps) => {
    if (!isMobile) return originalProps;
    
    // Adjust image sizes and positions for mobile
    const mobileAdjustments = {
      height: `${parseFloat(originalProps.height) * 0.8}`,  // Reduce size by 20%
      width: `${parseFloat(originalProps.width) * 0.8}`,    // Reduce size by 20%
    };

    return { ...originalProps, ...mobileAdjustments };
  };

 

  return (
    <>
    

      <Box p={{ xs: 1, sm: 2, md: 6 }}>
        <Grid container flexDirection={{ xs: "column", md: "row" }} p={{ xs: 2, sm: 3, md: 8 }} sx={{ minHeight: { xs: '90vh', md: 600 }, height: { xs: 'auto', md: 600 }, border: "2px solid #B99470", borderRadius: { xs: 5, md: 10 }, background: 'linear-gradient(135deg, #FBF9F1 10%, #FFF8E3 90%)', boxShadow: '0 8px 32px rgba(255, 182, 193, 0.2)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #FEFBD8, #DEAC80, #FEFAE0)', borderRadius: '10px 10px 0 0' }, '&::after': grassStyle("#90EE90", 2) }} >

        <Grid item xs={12} md={6} p={{ xs: 2, sm: 4, md:3,lg:4 }} sx={{ height: { xs: "100px",md:"60vh" ,lg: "520px" }, width: "100%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", mb: { xs: 4, md: 0 }, '&::after': grassStyle({ lg: "green" }, 1) }} >

           <Typography variant="h2" sx={{ fontWeight: 800, color: '#EF9C66', mb: { xs: 2, lg: 4 }, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '2rem', sm: '2.5rem', lg: '3.0rem' }, lineHeight: 1.2, textShadow: '2px 2px 4px rgba(255, 105, 180, 0.1)', textAlign: { xs: 'center', md: 'left' } }} >
             Experience the craft of survey creation
            </Typography>
           <Typography variant="h4" sx={{ color: '#666', mb: { xs: 3,md:1, lg: 5 }, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, lineHeight: 1.6, fontWeight: 400, textAlign: { xs: 'center', md: 'left' } }} >
              Easily design your survey in a matter of minutes. Access your audience on all platforms. Observe results visually and in real-time
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button variant="contained" href="/createform" sx={{ backgroundColor: "#EFBC9B", color: "white", mb: { xs: 2, lg: 6 }, padding: { xs: "10px 20px", md: "12px 30px" }, fontSize: { xs: "1rem", md: "1.1rem" }, borderRadius: "50px", textTransform: "none", boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)', transition: 'all 0.3s ease', '&:hover': { backgroundColor: "#C96868", transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(255, 105, 180, 0.4)' } }} >
                Create a Survey <ChevronRight sx={{ ml: 1 }} />
              </Button>
            </Box>
          </Grid>

         <Grid item xs={12} md={6} sx={{ height: { xs: "200vh", sm: "400px", md: "520px" }, width: "100%", position: "relative", top: { xs: "35vh", lg: 0 }, '&::after': grassStyle("green", 0) }} >

             {[ { src: skyImage, height: {xs:"20vh",md:"50%"}, width:  {xs:"20vh",md:"50%"}, bottom:{xs:"73vh" ,md:"80vh",lg:"70%"}, right: {xs:"-11vh",md:"0%"}, animation: `${float} 3s ease-in-out infinite`,filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))', '&:hover': {  transform: 'scale(1.1)', filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',  } }, 
            { src: flowerImage, height:{xs:"5vh", md:"10%"}, width:{xs:"5vh",md: "10%"}, bottom: {xs:"65vh",md:"80vh",lg:"50vh"}, left: {xs:"",md:"-106%"}  },
            { src: bulbImage, height: {xs:"8vh", md:"10%"}, width:{xs:"8vh", md:"10%"}, bottom: {xs:"35vh",md:"55%"}, right:{xs:"14vh",md: "34%"}, animation: `${float} 2.5s ease-in-out infinite` },
            { src: notebookImage, height: "10%", width: "10%", bottom: "45%", right: "25%",  },
            { src: pencilImage, height: "10%", width: "10%", bottom: "30%", right: "20%", animation: `${float} 3.5s ease-in-out infinite` },
            { src: managerImage, height:{xs:"45vh",md:"70%"} , width: {xs:"45vh",md:"70%"}, bottom: {xs:"-1vh",md:"35vh",lg:"0%"}, right: "10%",zIndex:5,filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))', '&:hover': {  transform: 'scale(1.1)', filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',  } },  
            { src: kittenImage, height: {xs:"10vh",md:"15%"}, width: {xs:"10vh",md:"15%"}, bottom: {xs:"10vh",md:"10%"}, left: {xs:"28vh",md:"30%"}, },
            { src: handImage, height: "30%", width: "30%", bottom: "0%", right: "0%", animation: `${float} 3.5s ease-in-out infinite` },
            { src: summerImage, height: "30%", width: "30%", bottom: "0%", left: "0%", animation: `${float} 4s ease-in-out infinite` } ].map((item, index) => ( 
            <Box key={index} component="img" src={item.src} sx={{ height: item.height, width: item.width, bottom: item.bottom, left: item.left, right: item.right, position: "absolute", zIndex: 1, animation: item.animation, transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)', } }} /> 
          ))} 
          </Grid>
        </Grid>
      </Box>

      <Suspense fallback={<Box sx={{ height: '200px' }} />}>
        <Card />
      </Suspense>

      
    </>
  );
}