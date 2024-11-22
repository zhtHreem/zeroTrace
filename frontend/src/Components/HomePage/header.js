import React from 'react'; 
import { Grid, Typography, Box, Button, keyframes } from '@mui/material'; 
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
import { Navbar,Footer } from './navbar';
import Card from './Cardform/card'
const float = keyframes` 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); }`; 
const rotate = keyframes` 0% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } 100% { transform: rotate(0deg); }`;

export default function Header() { 
  return ( 
    <>
        <Navbar/>
        
    <Box p={{ xs: 2, md: 8 }} sx={{  }}> 
      <Grid container flexDirection={{ xs: "column", md: "row" }} p={{ xs: 4, md: 8 }} sx={{ border: "2px solid #B99470", borderRadius: 10, background: 'linear-gradient(135deg, #FBF9F1 10%, #FFF8E3 90%)', boxShadow: '0 8px 32px rgba(255, 182, 193, 0.2)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #FEFBD8, #DEAC80, #FEFAE0)', borderRadius: '10px 10px 0 0', } }}> 
        <Grid item xs={12} md={6} p={{ xs: 2, md: 8 }}> 
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#EF9C66', mb: 3, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.2, textShadow: '2px 2px 4px rgba(255, 105, 180, 0.1)' }}>
           Experience the craft of survey creation 
           </Typography> 
          <Typography variant="h4" sx={{ color: '#666', mb: 4, fontSize: { xs: '1.25rem', md: '1.5rem' }, lineHeight: 1.6, fontWeight: 400 }}> 
          Easily design your survey in a matter of minutes. Access your audience on all platforms. Observe results visually and in real-time 
          </Typography> 
          <Button variant="contained" href="/createform" sx={{ backgroundColor: "#EFBC9B", color: "white", padding: "12px 30px", fontSize: "1.1rem", borderRadius: "50px", textTransform: "none", boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)', transition: 'all 0.3s ease', '&:hover': { backgroundColor: "#C96868", transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(255, 105, 180, 0.4)', } }}> 
            Create a Survey <ChevronRight sx={{ ml: 1 }} /> 
          </Button> 
        </Grid> 
        <Grid item xs={12} md={6} sx={{ height: { xs: "400px", md: "600px" }, width: "100%", position: "relative" }}> 
          {[ { src: skyImage, height: "50%", width: "50%", bottom: "70%", right: "0%", animation: `${float} 3s ease-in-out infinite` }, 
          { src: flowerImage, height: "10%", width: "10%", bottom: "60%", left: "0%",  },
           { src: bulbImage, height: "10%", width: "10%", bottom: "55%", right: "34%", animation: `${float} 2.5s ease-in-out infinite` },
           { src: notebookImage, height: "10%", width: "10%", bottom: "45%", right: "25%",  },
            { src: pencilImage, height: "10%", width: "10%", bottom: "30%", right: "20%", animation: `${float} 3.5s ease-in-out infinite` },
             { src: managerImage, height: "70%", width: "70%", bottom: "0%", right: "10%",}, 
             { src: kittenImage, height: "15%", width: "15%", bottom: "10%", left: "30%", },
              { src: handImage, height: "30%", width: "30%", bottom: "0%", right: "0%", animation: `${float} 3.5s ease-in-out infinite` },
             { src: summerImage, height: "30%", width: "30%", bottom: "0%", left: "0%", animation: `${float} 4s ease-in-out infinite` } ].map((item, index) => ( 
            <Box key={index} component="img" src={item.src} sx={{ height: item.height, width: item.width, bottom: item.bottom, left: item.left, right: item.right, position: "absolute", zIndex: 1, animation: item.animation, transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)', } }} /> 
          ))} 
        </Grid> 
      </Grid> 
    </Box> 
    < Card />
    <Footer/>
    </>
  ); 
}
