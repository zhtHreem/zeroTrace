// responseRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Response from './schema.js';
import Form from '../Form/schema.js';

const router = express.Router();



router.post('/responses', async (req, res) => {
  try {
    console.log("Body",req.body);

    const { formId, responses, user } = req.body;
    console.log("check",responses['673a5b8cf116641bb0219bd1'])
    // Fetch the form to get question details
    const form = await Form.findById(formId);
    console.log("FORMM",form)
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Format answers with question details
    const formattedAnswers = form.questions.map(question => ({
      question: question._id.toString(),
      questionTitle: question.title,
      answer: responses[question._id.toString()] || '',
      questionType: question.type
    }));
        console.log("format",formattedAnswers)

    // Create new response
    const newResponse = new Response({
      form: formId,
      user: user,
      answers: formattedAnswers
    });
    if (!formId || !formattedAnswers || !user) {
  return res.status(400).json({ message: 'formId, responses, and user are required' });
}
        console.log("id",formId,"user",user,"asnswer",formattedAnswers)  
        console.log("nformat",newResponse)

    await newResponse.save();
    res.status(201).json(newResponse);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Error submitting form response' });
  }
});

export default router;
