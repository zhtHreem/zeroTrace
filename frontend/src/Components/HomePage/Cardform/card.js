import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Button, Container, Box, Skeleton, Alert, AlertTitle, IconButton, useTheme } from '@mui/material';
import { Description as FormIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({ height: '180px', transition: 'all 0.3s ease-in-out', cursor: 'pointer', background: 'linear-gradient(135deg, #FFF8E7 0%, #FFF5E6 100%)', border: '1px solid rgba(239, 156, 102, 0.1)', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 8px 24px rgba(239, 156, 102, 0.15)', '& .form-icon': { transform: 'scale(1.1) rotate(5deg)' } } }));

const StyledFormIcon = styled(FormIcon)(({ theme }) => ({ fontSize: '40px', color: '#E88B5D', transition: 'transform 0.3s ease-in-out' }));

const FormCardSkeleton = () => (
  <Card sx={{ height: '180px', background: 'linear-gradient(135deg, #FFF8E7 0%, #FFF5E6 100%)' }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(239, 156, 102, 0.1)' }} />
      <Skeleton variant="text" width="70%" sx={{ bgcolor: 'rgba(239, 156, 102, 0.1)' }} />
      <Skeleton variant="text" width="50%" sx={{ bgcolor: 'rgba(239, 156, 102, 0.1)' }} />
    </CardContent>
  </Card>
);

const FormCard = React.memo(({ form, onClick }) => (
  <StyledCard onClick={onClick}>
    <CardContent sx={{ height: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', py: 3 }}>
      <StyledFormIcon className="form-icon" />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#333', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, fontWeight: 600, mb: 1 }}>{form.title}</Typography>
        <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 16, color: '#E88B5D' }} />
          {new Date(form.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </CardContent>
  </StyledCard>
));

const FormCards = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/forms`);
        if (!response.ok) throw new Error('Failed to fetch forms');
        const data = await response.json();
        setForms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleFormClick = (formId) => { navigate(`/form/${formId}`); };
  const displayedForms = showAll ? forms : forms.slice(0, 6);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ '& .MuiAlert-icon': { color: '#E88B5D' } }}>
          <AlertTitle>Error</AlertTitle>
          Failed to load surveys. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #B7E5B4 0%, #E88B5D 100%)', minHeight: { xs: '100vh', lg: '80vh' }, py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" sx={{ color: 'white', textAlign: 'center', fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, fontWeight: 700, mb: 4, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 60, height: 4, bgcolor: '#E88B5D', borderRadius: 2 } }}>Explore Surveys</Typography>
        <Suspense fallback={<Grid container spacing={3}>{[...Array(6)].map((_, index) => (<Grid item xs={12} sm={6} md={4} key={index}><FormCardSkeleton /></Grid>))}</Grid>}>
          {loading ? (
            <Grid container spacing={3}>{[...Array(6)].map((_, index) => (<Grid item xs={12} sm={6} md={4} key={index}><FormCardSkeleton /></Grid>))}</Grid>
          ) : forms.length === 0 ? (
            <Alert severity="info" sx={{ bgcolor: 'rgba(239, 156, 102, 0.1)', '& .MuiAlert-icon': { color: '#E88B5D' } }}>
              <AlertTitle>No Surveys</AlertTitle>
              No surveys available at the moment
            </Alert>
          ) : (
            <Box>
              <Grid container spacing={3}>{displayedForms.map((form) => (<Grid item xs={12} sm={6} md={4} key={form._id}><FormCard form={form} onClick={() => handleFormClick(form._id)} /></Grid>))}</Grid>
              {forms.length > 6 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                  <Button variant="contained" endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => { if (!showAll) { navigate("/surveys"); } setShowAll(!showAll); }} sx={{ bgcolor: '#E88B5D', '&:hover': { bgcolor: '#D67D4D' }, px: 4, py: 1, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}>{showAll ? 'Show Less' : 'See More'}</Button>
                </Box>
              )}
            </Box>
          )}
        </Suspense>
      </Container>
    </Box>
  );
};

export default FormCards;
