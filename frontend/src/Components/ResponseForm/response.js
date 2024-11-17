import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box,TextField,Paper,Typography,FormControl,RadioGroup,Radio,FormControlLabel,Checkbox,Select,MenuItem,Button,Stack,CircularProgress} from '@mui/material';

// Question components with unique identifiers
const ShortAnswerQuestion = ({ question, index, onResponseChange }) => {
  const [response, setResponse] = useState('');
  const uniqueId = `${question.id}-${index}`;

  const handleChange = (e) => {
    setResponse(e.target.value);
    onResponseChange(question.id, e.target.value);
  };

  return (
    <TextField fullWidth   variant="outlined" value={response}   onChange={handleChange}  id={uniqueId}/>
  );
};

const ParagraphQuestion = ({ question, index, onResponseChange }) => {
  const [response, setResponse] = useState('');
  const uniqueId = `${question.id}-${index}`;

  const handleChange = (e) => {
    setResponse(e.target.value);
    onResponseChange(question.id, e.target.value);
  };

  return (
    <TextField
      fullWidth
      multiline
      rows={4}
      variant="outlined"
      value={response}
      onChange={handleChange}
      id={uniqueId}
    />
  );
};

const MultipleChoiceQuestion = ({ question, index, onResponseChange }) => {
  const [response, setResponse] = useState('');
  const uniqueId = `${question.id}-${index}`;

  const handleChange = (e) => {
    setResponse(e.target.value);
    onResponseChange(question.id, e.target.value);
  };

  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup 
        value={response} 
        onChange={handleChange}
        name={uniqueId}
      >
        {question.options.map((option, optIndex) => (
          <FormControlLabel
            key={`${uniqueId}-${optIndex}`}
            value={option}
            control={<Radio />}
            label={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

const CheckboxQuestion = ({ question, index, onResponseChange }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const uniqueId = `${question.id}-${index}`;

  const handleChange = (option, checked) => {
    const newSelection = checked
      ? [...selectedOptions, option]
      : selectedOptions.filter(item => item !== option);
    
    setSelectedOptions(newSelection);
    onResponseChange(question.id, newSelection);
  };

  return (
    <FormControl component="fieldset" fullWidth>
      {question.options.map((option, optIndex) => (
        <FormControlLabel
          key={`${uniqueId}-${optIndex}`}
          control={
            <Checkbox
              id={`${uniqueId}-${optIndex}`}
              checked={selectedOptions.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
            />
          }
          label={option}
        />
      ))}
    </FormControl>
  );
};

const DropDownQuestion = ({ question, index, onResponseChange }) => {
  const [response, setResponse] = useState('');
  const uniqueId = `${question.id}-${index}`;

  const handleChange = (e) => {
    setResponse(e.target.value);
    onResponseChange(question.id, e.target.value);
  };

  return (
    <FormControl fullWidth>
      <Select 
        value={response} 
        onChange={handleChange}
        id={uniqueId}
      >
        {question.options.map((option, optIndex) => (
          <MenuItem key={`${uniqueId}-${optIndex}`} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const FormResponsePreview = () => {
  const [formData, setFormData] = useState(null);
  const [allResponses, setAllResponses] = useState({});
  const formId = "673a5b8cf116641bb0219bcf";
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
    setAllResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formData._id,
          responses: allResponses,
          user:userId
        })
      });
      const data = await response.json();
      console.log('Response submitted:', data);
      // Add success notification here
    } catch (error) {
      console.error('Error submitting response:', error);
      // Add error notification here
    }
  };

  const renderQuestion = (question, index) => {
    const props = {
      question,
      index,
      onResponseChange: handleResponseChange
    };

    switch (question.type) {
      case 'Short answer':
        return <ShortAnswerQuestion {...props} />;
      case 'Paragraph':
        return <ParagraphQuestion {...props} />;
      case 'Multiple choice':
        return <MultipleChoiceQuestion {...props} />;
      case 'Checkbox':
        return <CheckboxQuestion {...props} />;
      case 'Drop down':
        return <DropDownQuestion {...props} />;
      default:
        return null;
    }
  };

  if (!formData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
      <Paper elevation={3} sx={{ width: '100%', mb: 4, p: 4, backgroundColor: '#C1CFA1' }}>
        <Typography variant="h4" gutterBottom>
          {formData.title}
        </Typography>
        <Typography variant="body1">
          {formData.description}
        </Typography>
      </Paper>

      <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px' }}>
        {formData.questions.map((question, index) => (
          <Paper key={`${question.id}-${index}`} elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              {index + 1}. {question.title}
            </Typography>
            {renderQuestion(question, index)}
          </Paper>
        ))}
      </Stack>

      <Button variant="contained" size="large"  onClick={handleSubmit}  sx={{  backgroundColor: '#3A6351', mt: 4,  '&:hover': { backgroundColor: '#2C4F3B' }    }} >
        Submit Response
      </Button>
    </Box>
  );
};

export default FormResponsePreview;