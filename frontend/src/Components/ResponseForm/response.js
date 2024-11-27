import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Navbar, Footer } from '../HomePage/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import Recaptcha from '../Recapcha/recapcha';

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [decryptedResponse, setDecryptedResponse] = useState(null);
  const [unlockAt, setUnlockAt] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, submitted, decrypted
  const [formStatus, setFormStatus] = useState('loading'); // loading, active, closed, draft
  const [timeRemaining, setTimeRemaining] = useState(null); // Countdown for decryption
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const userId = JSON.parse(localStorage.getItem('user'));
  const { id } = useParams();
  const formId = id;

  useEffect(() => {
    if (!userId) {
      alert('You need to log in first!');
      window.location.href = '/login';
    }
  }, [userId]);

  const clearForm = () => {
    setAllResponses({});
    setErrors({});
    setIsCaptchaVerified(false);
    if (formData) {
      const form = document.getElementById('responseForm');
      if (form) {
        form.reset();
      }
    }
  };

  // Fetch form data and status
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/${formId}`);
        const data = await response.json();

        if (data.status === 'draft') {
          setFormStatus('draft');
        } else if (data.status === 'active') {
          setFormStatus('active');
        } else if (data.status === 'closed') {
          setFormStatus('closed');
        }

        setFormData(data);
        if (data.encryptionEndTime) {
          const remainingTime = new Date(data.encryptionEndTime) - new Date();
          setTimeRemaining(remainingTime > 0 ? remainingTime : 0);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Error loading form data');
        setFormStatus('error');
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
          } else if (res.status === 403) {
            const { unlockAt: unlockTime } = await res.json();
            setUnlockAt(new Date(unlockTime));
          }
        } catch (error) {
          console.error('Error fetching decrypted response:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [responseId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleResponseChange = (questionId, value) => {
    setAllResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCaptchaChange = (value) => {
    setIsCaptchaVerified(!!value);
  };

  const handleSubmit = async () => {
    try {
      if (formData?.user === userId) {
        alert('You cannot fill your own form!');
        return;
      }

      if (formStatus !== 'active') {
        toast.error('This form is not active. Submissions are not allowed.');
        return;
      }

      if (!isCaptchaVerified) {
        toast.error('Please complete the reCAPTCHA verification');
        return;
      }

      const newErrors = {};
      const requiredQuestions = formData.questions.filter((q) => q.required);
      const unansweredRequired = requiredQuestions.filter((q) => !allResponses[q._id]);

      if (unansweredRequired.length > 0) {
        unansweredRequired.forEach((q) => (newErrors[q._id] = true));
        setErrors(newErrors);
        toast.error('Please answer all required questions before submitting');
        return;
      }

      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, responses: allResponses, user: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        switch (data.code) {
          case 'DUPLICATE_SUBMISSION':
            toast.warning(`You've already submitted this form`);
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
      setResponseId(data.data.responseId);
      setUnlockAt(new Date(data.data.unlockAt));
      clearForm();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response. Please try again later.');
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'Short answer':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your answer here"
            onChange={(e) => handleResponseChange(question._id, e.target.value)}
            required={question.required}
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
            required={question.required}
          />
        );
      case 'Multiple choice':
        return (
          <FormControl component="fieldset" fullWidth required={question.required}>
            <RadioGroup
              onChange={(e) => handleResponseChange(question._id, e.target.value)}
              value={allResponses[question._id] || ''}
            >
              {question.options.map((option, idx) => (
                <FormControlLabel key={idx} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'Checkbox':
        return (
          <FormControl component="fieldset" fullWidth required={question.required}>
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
                        : selected.filter((item) => item !== option);
                      handleResponseChange(question._id, updated);
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormControl>
        );
      case 'Drop down':
        return (
          <FormControl fullWidth required={question.required}>
            <Select
              onChange={(e) => handleResponseChange(question._id, e.target.value)}
              value={allResponses[question._id] || ''}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Select an option</em>
              </MenuItem>
              {question.options.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[question._id] && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );
      default:
        console.error('Unknown question type:', question.type);
        return <Typography>Unknown question type</Typography>;
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 4 }}>
        {formData && (
          <Paper elevation={3} sx={{ width: '100%', mb: 4, p: 4, backgroundColor: '#C1CFA1' }}>
            <Typography variant="h4" gutterBottom>
              {formData.title}
            </Typography>
            <Typography variant="body1">{formData.description}</Typography>
            {formStatus === 'draft' && (
              <Typography variant="body2" color="error">
                This form is in draft mode and cannot accept responses.
              </Typography>
            )}
            {formStatus === 'closed' && (
              <Typography variant="body2" color="error">
                This form is closed and cannot accept responses.
              </Typography>
            )}
          </Paper>
        )}
        <form id="responseForm">
          <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px' }}>
            {formStatus === 'active' &&
              formData?.questions.map((question, index) => (
                <Paper key={`${question._id}-${index}`} elevation={3} sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {index + 1}. {question.title} {question.required && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  {renderQuestion(question, index)}
                </Paper>
              ))}
          </Stack>
        </form>

        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
          <Recaptcha onChange={handleCaptchaChange} />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{ backgroundColor: '#3A6351', mt: 4, '&:hover': { backgroundColor: '#2C4F3B' } }}
          disabled={formStatus !== 'active'}
        >
          Submit Response
        </Button>
        {timeRemaining > 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Time Remaining: {new Date(timeRemaining).toISOString().substr(11, 8)}
          </Typography>
        )}
        {unlockAt && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Decryption will be available at: {new Date(unlockAt).toLocaleString()}
          </Typography>
        )}
        {status === 'decrypted' && (
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
        )}
      </Box>
      <ToastContainer position="top-right" autoClose={5000} />
      <Footer />
    </>
  );
};

export default FormResponsePreview;
