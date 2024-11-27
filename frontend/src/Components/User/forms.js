import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserForms = ({ userId }) => {
  const [forms, setForms] = useState([]); // Initialize forms as an empty array
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/forms/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch forms');
        }
        const data = await response.json();
        setForms(data);
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchForms();
    } else {
      setError('User ID is required to fetch forms');
      setLoading(false);
    }
  }, [userId]);

  const handleActivate = async (formId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/activate/${formId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        const { encryptionEndTime, activationTime } = data.form;

        alert(
          `Survey activated successfully!\nStart Time: ${new Date(
            activationTime
          ).toLocaleString()}\nEnd Time: ${new Date(encryptionEndTime).toLocaleString()}`
        );

        // Update local state to reflect activation
        setForms((prevForms) =>
          prevForms.map((form) =>
            form._id === formId
              ? {
                  ...form,
                  status: 'active',
                  activationTime: new Date(activationTime),
                  encryptionEndTime: new Date(encryptionEndTime),
                }
              : form
          )
        );
      } else {
        const errorData = await response.json();
        alert(`Failed to activate survey: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Error activating survey:', err);
      alert('An error occurred while activating the survey.');
    }
  };

  if (loading) {
    return <Typography>Loading surveys...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

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
            {form.status === 'active' && (
              <Typography variant="body2" color="success.main">
                Activation Ends: {new Date(form.encryptionEndTime).toLocaleString()}
              </Typography>
            )}
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
