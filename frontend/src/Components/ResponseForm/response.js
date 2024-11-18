import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, Paper, Typography, FormControl, RadioGroup, Radio, FormControlLabel, Checkbox, Select, MenuItem, Button, Stack, CircularProgress, FormHelperText } from '@mui/material';
import { Navbar,Footer } from '../HomePage/navbar';
const ShortAnswerQuestion = ({ question, index, onResponseChange, error }) => (
  <TextField fullWidth variant="outlined" onChange={(e) => onResponseChange(question._id, e.target.value)} id={`${question._id}-${index}`} error={error} helperText={error ? "This field is required" : ""} required={question.required} />
);

const ParagraphQuestion = ({ question, index, onResponseChange, error }) => (
  <TextField fullWidth multiline rows={4} variant="outlined" onChange={(e) => onResponseChange(question._id, e.target.value)} id={`${question._id}-${index}`} error={error} helperText={error ? "This field is required" : ""} required={question.required} />
);

const MultipleChoiceQuestion = ({ question, index, onResponseChange, error }) => (
  <FormControl component="fieldset" fullWidth error={error} required={question.required}>
    <RadioGroup onChange={(e) => onResponseChange(question._id, e.target.value)} name={`${question._id}-${index}`}>
      {question.options.map((option, optIndex) => (
        <FormControlLabel key={`${question._id}-${index}-${optIndex}`} value={option} control={<Radio />} label={option} />
      ))}
    </RadioGroup>
    {error && <FormHelperText>This field is required</FormHelperText>}
  </FormControl>
);

const CheckboxQuestion = ({ question, index, onResponseChange, error }) => {
  const handleChange = (option, checked, currentSelected = []) => {
    const newSelection = checked ? [...currentSelected, option] : currentSelected.filter(item => item !== option);
    onResponseChange(question._id, newSelection);
  };
  
  return (
    <FormControl component="fieldset" fullWidth error={error} required={question.required}>
      {question.options.map((option, optIndex) => (
        <FormControlLabel key={`${question._id}-${index}-${optIndex}`} control={<Checkbox onChange={(e) => handleChange(option, e.target.checked)} />} label={option} />
      ))}
      {error && <FormHelperText>This field is required</FormHelperText>}
    </FormControl>
  );
};

const DropDownQuestion = ({ question, index, onResponseChange, error }) => (
  <FormControl fullWidth error={error} required={question.required}>
    <Select onChange={(e) => onResponseChange(question._id, e.target.value)} id={`${question._id}-${index}`}>
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
  const userId = '648cb2c4b159e4184d54aeda';

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/${formId}`);
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Error fetching form:', error);
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
        alert('Please answer all required questions before submitting');
        return;
      }

      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, responses: allResponses, user: userId })
      });

      if (!response.ok) throw new Error('Failed to submit response');
      
      const data = await response.json();
      alert('Form submitted successfully!');
      setAllResponses({});
      setErrors({});
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const renderQuestion = (question, index) => {
    const props = {
      question,
      index,
      onResponseChange: handleResponseChange,
      error: errors[question._id]
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
      <Navbar/>
      
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',px:4 }}>
      <Paper elevation={3} sx={{ width: '100%', mb: 4, p: 4, backgroundColor: '#C1CFA1' }}>
        <Typography variant="h4" gutterBottom>{formData.title}</Typography>
        <Typography variant="body1">{formData.description}</Typography>
      </Paper>
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
      <Button variant="contained" size="large" onClick={handleSubmit} sx={{ backgroundColor: '#3A6351', mt: 4, '&:hover': { backgroundColor: '#2C4F3B' } }}>
        Submit Response
      </Button>
    </Box>
    <Footer/>
    </>
  );
};

export default FormResponsePreview;