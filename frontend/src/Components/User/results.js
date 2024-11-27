import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Navbar, Footer } from '../HomePage/navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ResultsPage = () => {
  const { formId } = useParams();
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/forms/${formId}/responses`);
        const data = await response.json();
        setResponses(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch responses:', err);
        setError('Failed to load responses.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [formId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  // Helper function to aggregate response data for charts
  const aggregateResponses = (answers) => {
    if (!answers || answers.length === 0) return { labels: [], data: [] };

    const aggregation = {};
    answers.forEach((answer) => {
      if (answer?.answer) {
        const response = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
        response.forEach((res) => {
          aggregation[res] = (aggregation[res] || 0) + 1;
        });
      }
    });

    return {
      labels: Object.keys(aggregation),
      data: Object.values(aggregation),
    };
  };

  // Render charts or textual responses based on question type
  const renderResponses = (question, answers) => {
    const { labels, data } = aggregateResponses(answers);

    if (labels.length === 0) {
      return <Typography>No responses available for this question.</Typography>;
    }

    const questionType = question.questionType?.toLowerCase().trim();

    if (questionType === 'multiple choice' || questionType === 'checkbox') {
      return (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: question.questionTitle,
                data,
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'],
                borderColor: ['#388e3c', '#1976d2', '#f57c00', '#d32f2f', '#7b1fa2'],
                borderWidth: 1,
              },
            ],
          }}
          options={{ plugins: { legend: { display: false } } }}
        />
      );
    } else if (questionType === 'dropdown' || questionType === 'drop down') {
      return (
        <Pie
          data={{
            labels,
            datasets: [
              {
                label: question.questionTitle,
                data,
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'],
                hoverOffset: 4,
              },
            ],
          }}
        />
      );
    } else if (questionType === 'short answer' || questionType === 'paragraph') {
      return (
        <Box>
          {answers.map((answer, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
              {idx + 1}. {answer?.answer || 'No response'}
            </Typography>
          ))}
        </Box>
      );
    } else {
      return (
        <Typography>
          Unsupported question type: {questionType || 'Unknown'}.
        </Typography>
      );
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Results for Form
        </Typography>
        {responses && responses.length ? (
          responses[0]?.decrypted ? (
            responses[0]?.answers?.map((question, index) => (
              <Paper key={index} elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {question.questionTitle || 'Untitled Question'}
                </Typography>
                <Box sx={{ height: '300px' }}>
                  {renderResponses(question, responses.map((r) => r.answers?.[index] || null))}
                </Box>
              </Paper>
            ))
          ) : (
            <Typography>Responses are still locked and cannot be decrypted at this time.</Typography>
          )
        ) : (
          <Typography>No responses found.</Typography>
        )}
      </Box>
      <Footer />
    </>
  );
};

export default ResultsPage;
