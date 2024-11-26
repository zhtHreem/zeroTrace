import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserForms = ({ userId }) => {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/user/${userId}`);
        const data = await response.json();
        setForms(data);
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      }
    };

    fetchForms();
  }, [userId]);

  const handleActivate = async (formId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/activate/${formId}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Survey activated successfully!');
        // Update local state to reflect activation
        setForms((prevForms) =>
          prevForms.map((form) =>
            form._id === formId ? { ...form, status: 'active', activationTime: new Date() } : form
          )
        );
      } else {
        alert('Failed to activate survey. Please try again.');
      }
    } catch (err) {
      console.error('Error activating survey:', err);
      alert('An error occurred while activating the survey.');
    }
  };

  if (!forms.length) {
    return <Typography>No surveys found.</Typography>;
  }

  return (
    <Box>
      {forms.map((form) => (
        <Card key={form._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{form.title}</Typography>
            <Typography variant="body2">{form.description}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
              <Chip
                label={form.status === 'active' ? 'Active' : form.status === 'closed' ? 'Closed' : 'Draft'}
                color={form.status === 'active' ? 'success' : 'default'}
                sx={{ fontWeight: 'bold' }}
              />
              <Button
                variant="contained"
                onClick={() => navigate(`/form/${form._id}`)}
                sx={{ backgroundColor: '#3A6351', '&:hover': { backgroundColor: '#2C4F3B' } }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/results/${form._id}`)}
                sx={{ borderColor: '#C96868', color: '#C96868', '&:hover': { backgroundColor: '#F8EAEA' } }}
              >
                Results
              </Button>
              <Button
                variant="contained"
                disabled={form.status !== 'draft'} // Enable only if the form is in draft status
                onClick={() => handleActivate(form._id)}
                sx={{
                  backgroundColor: form.status === 'draft' ? '#FFD700' : '#B0BEC5',
                  '&:hover': { backgroundColor: form.status === 'draft' ? '#FFCC00' : '#B0BEC5' },
                }}
              >
                Activate
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default UserForms;
