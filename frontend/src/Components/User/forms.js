import React, { useState, useEffect } from 'react';
import { Avatar, Box, Container, Typography, Button, Paper, Card, CardContent, Chip } from '@mui/material';

import axios from 'axios';

const UserForms = ({userId}) => {
  const [forms, setForms] = useState([]); // Initialize forms as an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/user/${userId}`);
        const data = await response.json();
        setForms(data); // Update forms with fetched data
       // console.log(data); 
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError('Failed to load forms. Please try again.'); // Set error message
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchForms();
  }, []); // Run only on component mount

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render error state
  if (error) {
    return <p>{error}</p>;
  }

  // Render empty state
  if (!forms || forms.length === 0) {
    return <p>No forms available</p>;
  }

  // Render forms
  return (
    <div className="form-cards-container">
       
    {forms.map((form) => (
            <Paper key={form._id} sx={{ mb: 2, p: 2, borderRadius: 3, background: 'linear-gradient(to right, #FFC6AC, white)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{form.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.questions.length} Questions | 0 Responses
                  </Typography>
                </Box>
                <Button variant="outlined" color="secondary" size="small" href={`/form/${form._id}`}>View</Button>
              </Box>
            </Paper>
          ))}
    </div>
  );
};

export default UserForms;
