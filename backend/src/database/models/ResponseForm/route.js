import express from 'express';
import mongoose from 'mongoose';
import { Response, SubmissionTracking } from './schema.js';
import  ZKPSubmissionManager  from './zkp.js';
import Form from '../Form/schema.js';

const router = express.Router();
const zkpManager = new ZKPSubmissionManager();

router.post('/responses', async (req, res) => {



  try {
    const { formId, responses, user } = req.body;

    // Validate input
    if (!formId || !responses || !user) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'formId, responses, and user are required' 
      });
    }

    // Generate ZKP commitment
    const { commitment, nullifier } = await zkpManager.generateZKPCommitment(user, formId);

    // Verify submission uniqueness
    const isUniqueSubmission = await zkpManager.verifySubmissionUniqueness(commitment, nullifier,formId);
    if (!isUniqueSubmission) {
      return res.status(409).json({ 
        status: 'error',
        code: 'DUPLICATE_SUBMISSION',
        message: 'You have already submitted a response for this form'
      });
    }

    // Fetch the form to get question details
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        status: 'error',
        code: 'FORM_NOT_FOUND',
        message: 'Form not found'  
      });
    }

    // Format answers with question details
    const formattedAnswers = form.questions.map(question => ({
      question: question._id.toString(),
      questionTitle: question.title,
      answer: responses[question._id.toString()] || '',
      questionType: question.type
    }));

    // Create new response with ZKP commitment
    const newResponse = new Response({
      form: formId,
      commitment,  // Use ZKP commitment instead of user ID
      nullifier,   // Store nullifier for additional security
      answers: formattedAnswers
    });
    const savedResponse = await newResponse.save();
    
     // Create submission tracking
    const submissionTracking = new SubmissionTracking({
      formId,
      submissionHash: commitment,
      nullifier
    });


    await submissionTracking.save();
   
    res.status(201).json({ 
      status: 'success',
      code: 'SUBMISSION_SUCCESSFUL',
      message: 'Response submitted successfully',
      data: {
         responseId: savedResponse._id,
        submittedAt: savedResponse.submittedAt,
        commitment
      }
    });

  } catch (error) {

    console.error('Error submitting response:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SUBMISSION_FAILED',
      message: 'Error submitting form response',
      error: error.message
    });
  } 
});


  


export default router;