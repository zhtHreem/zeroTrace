import express from 'express';
import mongoose from 'mongoose';
import { Response, SubmissionTracking } from './schema.js';
import { encryptResponse, decryptResponse } from '../Encryption/encryption.js'; // Encryption logic
import crypto from 'crypto';
import  ZKPSubmissionManager  from './zkp.js';
import Form from '../Form/schema.js';

const router = express.Router();
const zkpManager = new ZKPSubmissionManager();

// Submit a response
router.post('/responses', async (req, res) => {



  try {
    const { formId, responses, user } = req.body;

    // Validate input
    if (!formId || !responses || !user) {
      return res.status(400).json({ message: 'formId, responses, and user are required' });
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

    // Encrypt the formatted answers
    const { encryptedData, iv } = encryptResponse(JSON.stringify(formattedAnswers));
    // Add logging for encryption results
    console.log('Encryption Results:', {
      encryptedDataType: typeof encryptedData,
      encryptedDataLength: encryptedData.length,
      ivType: typeof iv,
      ivLength: iv.length
    });

    
    // Set unlock time (e.g., 10 minutes from now)
    console.log("time::",form.decryptionTime/60)
    const unlockAt = new Date();
    unlockAt.setMinutes(unlockAt.getMinutes() + (form.decryptionTime/60));

    // Create new response with ZKP commitment
    const newResponse = new Response({
      form: formId,
      commitment,  // Use ZKP commitment instead of user ID
      nullifier,   // Store nullifier for additional security
   //   answers: formattedAnswers
      answers: { encryptedData, iv }, // Store encrypted answers
      unlockAt
    });

    // Add logging before saving
    console.log('New Response Object:', JSON.stringify(newResponse.toObject(), null, 2));
    const savedResponse = await newResponse.save();
        console.log('Saved Response:', JSON.stringify(savedResponse.toObject(), null, 2));

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

// Endpoint to fetch and decrypt responses
router.get('/responses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid response ID' });
    }

    const response = await Response.findById(id);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if the response is still locked
    if (new Date() < new Date(response.unlockAt)) {
      return res.status(403).json({ message: 'Response is still locked.', unlockAt: response.unlockAt });
    }

    // Decrypt the response
    const { encryptedData, iv } = response.answers;
    const decryptedAnswers = decryptResponse(encryptedData, iv);

    // Update the decrypted data in the database for future use
    response.decryptedAnswers = JSON.parse(decryptedAnswers);
    await response.save();

    res.status(200).json({ decryptedAnswers: JSON.parse(decryptedAnswers) });
  } catch (error) {
    console.error('Error fetching or decrypting response:', error);
    res.status(500).json({ message: 'Error fetching or decrypting response' });
  }
});


  


export default router;