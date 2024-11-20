import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Typography, FormControl, RadioGroup, Radio, FormControlLabel, Checkbox, Select, MenuItem, Button, Stack, CircularProgress, FormHelperText } from '@mui/material';
import { Navbar, Footer } from '../HomePage/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShortAnswerQuestion = ({ question, index, onResponseChange, error, value }) => (
  <TextField 
    fullWidth  variant="outlined"  onChange={(e) => onResponseChange(question._id, e.target.value)} 
    id={`${question._id}-${index}`} 
    error={error} helperText={error ? "This field is required" : ""}  required={question.required} value={value || ''} />
);

const ParagraphQuestion = ({ question, index, onResponseChange, error, value }) => (
  <TextField 
    fullWidth  multiline  rows={4}  variant="outlined" 
    onChange={(e) => onResponseChange(question._id, e.target.value)} 
    id={`${question._id}-${index}`} 
    error={error}  helperText={error ? "This field is required" : ""} required={question.required} value={value || ''}  />
);

const MultipleChoiceQuestion = ({ question, index, onResponseChange, error, value }) => (
  <FormControl component="fieldset" fullWidth error={error} required={question.required}>
    <RadioGroup    onChange={(e) => onResponseChange(question._id, e.target.value)}    name={`${question._id}-${index}`} value={value || ''} >
      {question.options.map((option, optIndex) => (
        <FormControlLabel key={`${question._id}-${index}-${optIndex}`} value={option} control={<Radio />} label={option} />
      ))}
    </RadioGroup>
    {error && <FormHelperText>This field is required</FormHelperText>}
  </FormControl>
);

const CheckboxQuestion = ({ question, index, onResponseChange, error, value = [] }) => {
  const handleChange = (option, checked) => {
    const newSelection = checked 
      ? [...(value || []), option] 
      : (value || []).filter(item => item !== option);
    onResponseChange(question._id, newSelection);
  };
  
  return (
    <FormControl component="fieldset" fullWidth error={error} required={question.required}>
      {question.options.map((option, optIndex) => (
        <FormControlLabel 
          key={`${question._id}-${index}-${optIndex}`} 
          control={ <Checkbox   checked={(value || []).includes(option)} onChange={(e) => handleChange(option, e.target.checked)}   /> }  label={option}  />
      ))}
      {error && <FormHelperText>This field is required</FormHelperText>}
    </FormControl>
  );
};

const DropDownQuestion = ({ question, index, onResponseChange, error, value }) => (
  <FormControl fullWidth error={error} required={question.required}>
    <Select 
      onChange={(e) => onResponseChange(question._id, e.target.value)} 
      id={`${question._id}-${index}`}
      value={value || ''}
    >
      <MenuItem value=""><em>None</em></MenuItem>
      {question.options.map((option, optIndex) => (
        <MenuItem key={`${question._id}-${index}-${optIndex}`} value={option}>{option}</MenuItem>
      ))}
    </Select>
    {error && <FormHelperText>This field is required</FormHelperText>}
  </FormControl>
);

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const [errors, setErrors] = useState({});
  const formId = "673bb8d90e6c4cecc039a4ab";
  const userId = '648cb2c4b159e4184d54aeaa';

  const clearForm = () => {
    setAllResponses({});
    setErrors({});
    // Reset all form elements to their initial state
    if (formData) {
      const form = document.getElementById('responseForm');
      if (form) {
        form.reset();
      }
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/${formId}`);
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Error loading form data');
      }
    };
    fetchForm();
  }, [formId]);

  const handleResponseChange = (questionId, value) => {
    if (!questionId || questionId === 'undefined') return;
    setAllResponses(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => ({ ...prev, [questionId]: false }));
  };

  const handleSubmit = async () => {
    try {
      const newErrors = {};
      const requiredQuestions = formData.questions.filter(q => q.required);
      const unansweredRequired = requiredQuestions.filter(q => !allResponses[q._id]);
      
      if (unansweredRequired.length > 0) {
        unansweredRequired.forEach(q => newErrors[q._id] = true);
        setErrors(newErrors);
        toast.error('Please answer all required questions before submitting');
        return;
      }

      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, responses: allResponses, user: userId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        switch (data.code) {
          case 'DUPLICATE_SUBMISSION':
            toast.warning(`You've already submitted this form on ${new Date(data.submittedAt).toLocaleDateString()}`);
            break;
          case 'FORM_NOT_FOUND':
            toast.error('This form no longer exists');
            break;
          case 'MISSING_FIELDS':
            toast.error('Please fill in all required fields');
            break;
          default:
            toast.error('An error occurred while submitting the form');
        }
        throw new Error(data.message);
      }

      toast.success('Form submitted successfully!');
      clearForm(); // Clear the form after successful submission
    } catch (error) {
      console.error('Error submitting response:', error);
      if (!error.message.includes('already submitted')) {
        toast.error('Failed to submit response. Please try again later.');
      }
    }
  };

  const renderQuestion = (question, index) => {
    const props = {
      question,
      index,
      onResponseChange: handleResponseChange,
      error: errors[question._id],
      value: allResponses[question._id]
    };

    switch (question.type) {
      case 'Short answer': return <ShortAnswerQuestion {...props} />;
      case 'Paragraph': return <ParagraphQuestion {...props} />;
      case 'Multiple choice': return <MultipleChoiceQuestion {...props} />;
      case 'Checkbox': return <CheckboxQuestion {...props} />;
      case 'Drop down': return <DropDownQuestion {...props} />;
      default: return null;
    }
  };

  if (!formData) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 4 }}>
        <Paper elevation={3} sx={{ width: '100%', mb: 4, p: 4, backgroundColor: '#C1CFA1' }}>
          <Typography variant="h4" gutterBottom>{formData.title}</Typography>
          <Typography variant="body1">{formData.description}</Typography>
        </Paper>
        <form id="responseForm">
          <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px' }}>
            {formData.questions.map((question, index) => (
              <Paper key={`${question._id}-${index}`} elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {index + 1}. {question.title} {question.required && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                {renderQuestion(question, index)}
              </Paper>
            ))}
          </Stack>
        </form>
        <Button  variant="contained"    size="large"    onClick={handleSubmit}   sx={{   backgroundColor: '#3A6351',    mt: 4,   '&:hover': {  backgroundColor: '#2C4F3B'  }    }} >
          Submit Response
        </Button>
      </Box>
      <ToastContainer position="top-right" autoClose={5000} />
      <Footer />
    </>
  );
};

export default FormResponsePreview;