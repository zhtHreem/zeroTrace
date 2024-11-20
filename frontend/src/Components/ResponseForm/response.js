import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, CircularProgress, FormControlLabel, Checkbox, Radio, RadioGroup, TextField } from '@mui/material';
import { Navbar, Footer } from '../HomePage/navbar';

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [decryptedResponse, setDecryptedResponse] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitted, decrypted
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
      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, responses: allResponses, user: userId })
      });

      const data = await response.json();
      if (response.ok) {
        setResponseId(data.id);
        setAllResponses({});
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'Short answer':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your answer here"
            onChange={(e) => handleResponseChange(question._id, e.target.value)}
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
          />
        );
      case 'Multiple choice':
        return (
          <RadioGroup onChange={(e) => handleResponseChange(question._id, e.target.value)}>
            {question.options.map((option, index) => (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        );
      case 'Checkbox':
        return (
          <Stack>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    onChange={(e) => {
                      const currentSelection = allResponses[question._id] || [];
                      const updatedSelection = e.target.checked
                        ? [...currentSelection, option]
                        : currentSelection.filter(item => item !== option);
                      handleResponseChange(question._id, updatedSelection);
                    }}
                  />
                }
                label={option}
              />
            ))}
          </Stack>
        );
      default:
        return null;
    }
  };

  const renderDecryptedResponse = () => {
    return (
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
  };

  if (!formData) return <CircularProgress />;

  return (
    <>
      <Navbar />
      <Box sx={{ px: 4, py: 2 }}>
        {status === 'idle' && (
          <>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {formData.title}
              </Typography>
              <Typography variant="body1" sx={{ color: 'gray' }}>
                {formData.description}
              </Typography>
            </Paper>
            <Stack spacing={4}>
              {formData.questions.map((question, index) => (
                <Paper key={index} elevation={3} sx={{ p: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {index + 1}. {question.title} {question.required && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  {renderQuestion(question)}
                </Paper>
              ))}
            </Stack>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                mt: 4,
                backgroundColor: '#3A6351',
                color: '#FFF',
                '&:hover': { backgroundColor: '#2C4F3B' }
              }}
            >
              Submit Response
            </Button>
          </>
        )}

        {status === 'submitted' && (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
            Response submitted. Decrypting... Please wait.
          </Typography>
        )}

        {status === 'decrypted' && decryptedResponse && renderDecryptedResponse()}
      </Box>
      <Footer />
    </>
  );
};

export default FormResponsePreview;
