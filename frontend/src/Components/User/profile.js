import React, { useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Box, Container, Typography, Button, Paper, Card, CardContent, Chip } from '@mui/material';
import { Cake as CakeIcon, AddCircleOutline as AddIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import { Navbar,Footer } from '../HomePage/navbar';
import UserForms from './forms';
const UserProfile = () => {
  const [surveys] = useState([
    { id: 1, title: '🌈 Happiness Check', emoji: '😊', questions: 5, responses: 142 },
    { id: 2, title: '🐶 Puppy Love Poll', emoji: '🐾', questions: 10, responses: 87 }
  ]);
    const { search } = useParams();
    const [user, setUser] = useState([]); // Initialize forms as an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/user/${search}`);
        const data = await response.json();
        setUser(data); // Update forms with fetched data
     //   console.log(data); 
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError('Failed to load forms. Please try again.'); // Set error message
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchUser();
  }, []); // Run only on component mount

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }
  
  function getName(email) {
  // Split the email string at '@' to get the username part
  const username = email.split('@')[0];

  // Split the username by letters to get individual words
  const words = username.match(/[A-Za-z]+/g);

  // Get the first two words and join them with a space
  return words ? words.slice(0, 2).join(' ') : '';
}
  // Render error state
  if (error) {
    return <p>{error}</p>;
  }

  // Render empty state
  if (!user || user.length === 0) {
    return <p>No forms available</p>;
  }
  return (
    <>
        <Navbar/>
 
    <Container maxWidth="sm" sx={{ background: 'linear-gradient(135deg, #FFE5E5, #E5F4FF)', minHeight: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, mb: 3, p: 3, background: 'white' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 150, height: 150, mb: 2, border: '4px solid pink', background: 'linear-gradient(45deg, #C8E4B2, #3A4D39)' }}>
            <PersonIcon sx={{ fontSize: 100, color: 'white' }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#C96868', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            {getName(user.email)} 😊
          </Typography>
          <Chip label="User" color="secondary" variant="outlined" sx={{ mt: 1 }} />
        </Box>
      </Paper>

      <Card sx={{ borderRadius: 4, background: 'rgba(255,255,255,0.9)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#C96868' }}>My Surveys</Typography>
            <Button href="/createform" variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 3, background: 'linear-gradient(45deg, #3A4D39, #99B080)' }}>
              New Survey
            </Button>
          </Box>

          

           <UserForms userId={search}/>

        </CardContent>
      </Card>
    </Container>
           <Footer/>
    </>
  );
};

export default UserProfile;