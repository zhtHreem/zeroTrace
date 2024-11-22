import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, CircularProgress, FormControlLabel, Checkbox, Radio, RadioGroup, TextField, FormControl, Select, MenuItem, FormHelperText } from '@mui/material';
import { Navbar, Footer } from '../HomePage/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [decryptedResponse, setDecryptedResponse] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, submitted, decrypted
  
  const userId = JSON.parse(localStorage.getItem('user'));
 
   if (!userId) {
  alert('You need to log in first!');
  window.location.href = '/login';
  } 


  
  const { id } = useParams();
  const formId = id //"673f128f64efaa790dbefbb2";
  const clearForm = () => {
    setAllResponses({});
    setErrors({});
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

  useEffect(() => {
    if (responseId) {
      setStatus('submitted');
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/responses/${responseId}`);
          if (res.ok) {
            const data = await res.json();
            setDecryptedResponse(data.decryptedAnswers);
            setStatus('decrypted');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error fetching decrypted response:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [responseId]);

  const handleResponseChange = (questionId, value) => {
    setAllResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {

      if(formData.user===userId){
          alert('You cannot fill your own form!');
        }
      else{
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
            toast.warning(`You've already submitted this form `);
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
      setResponseId(data.id);
      clearForm();
    }} catch (error) {
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
      case 'Short answer':
        return (
          <TextField 
            fullWidth 
            variant="outlined" 
            placeholder="Type your answer here" 
            onChange={(e) => handleResponseChange(question._id, e.target.value)} 
            error={errors[question._id]} 
            helperText={errors[question._id] ? "This field is required" : ""} 
          />
        );
      case 'Paragraph':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your detailed response here"
            onChange={(e) => handleResponseChange(question._id, e.target.value)}
            error={errors[question._id]}
            helperText={errors[question._id] ? "This field is required" : ""}
          />
        );
      case 'Multiple choice':
        return (
          <FormControl component="fieldset" fullWidth error={errors[question._id]} required={question.required}>
            <RadioGroup onChange={(e) => handleResponseChange(question._id, e.target.value)} value={allResponses[question._id] || ''}>
              {question.options.map((option, idx) => (
                <FormControlLabel key={idx} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            {errors[question._id] && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );
      case 'Checkbox':
        return (
          <FormControl component="fieldset" fullWidth error={errors[question._id]} required={question.required}>
            {question.options.map((option, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={(allResponses[question._id] || []).includes(option)}
                    onChange={(e) => {
                      const selected = allResponses[question._id] || [];
                      const updated = e.target.checked
                        ? [...selected, option]
                        : selected.filter(item => item !== option);
                      handleResponseChange(question._id, updated);
                    }}
                  />
                }
                label={option}
              />
            ))}
            {errors[question._id] && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );
      case 'Dropdown':
        return (
          <FormControl fullWidth error={errors[question._id]} required={question.required}>
            <Select
              onChange={(e) => handleResponseChange(question._id, e.target.value)}
              value={allResponses[question._id] || ''}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {question.options.map((option, idx) => (
                <MenuItem key={idx} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {errors[question._id] && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );
      default:
        return null;
    }
  };

  const renderDecryptedResponse = () => (
    <Stack spacing={2} sx={{ mt: 4 }}>
      {decryptedResponse.map((item, index) => (
        <Paper key={index} elevation={2} sx={{ p: 2, backgroundColor: '#F8F9FA' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {item.questionTitle}
          </Typography>
          <Typography variant="body1">
            {Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );

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
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleSubmit} 
          sx={{ backgroundColor: '#3A6351', mt: 4, '&:hover': { backgroundColor: '#2C4F3B' } }}
        >
          Submit Response
        </Button>
      </Box>
      <ToastContainer position="top-right" autoClose={5000} />
      <Footer />
    </>
  );
};

export default FormResponsePreview;
