import express from 'express';
import mongoose from 'mongoose';
import { Response, SubmissionTracking } from './schema.js';
import { encryptResponse, decryptResponse } from '../Encryption/encryption.js';
import crypto from 'crypto';
import ZKPSubmissionManager from './zkp.js';
import Form from '../Form/schema.js';
import moment from 'moment'; // For dynamic time calculation

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

    // Fetch the form to validate its state
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        status: 'error',
        code: 'FORM_NOT_FOUND',
        message: 'Form not found',
      });
    }

    const now = new Date();
    // Ensure the form is active and within the active period
    if (form.status !== 'active' || now > new Date(form.encryptionEndTime)) {
      return res.status(403).json({ error: 'Form is not accepting submissions.' });
    }

    // Generate ZKP commitment
    const { commitment, nullifier } = await zkpManager.generateZKPCommitment(user, formId);

    // Verify submission uniqueness
    const isUniqueSubmission = await zkpManager.verifySubmissionUniqueness(commitment, nullifier, formId);
    if (!isUniqueSubmission) {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_SUBMISSION',
        message: 'You have already submitted a response for this form',
      });
    }

    // Format answers with question details
    const formattedAnswers = form.questions.map((question) => ({
      question: question._id.toString(),
      questionTitle: question.title,
      answer: responses[question._id.toString()] || '',
      questionType: question.type,
    }));

    // Encrypt the formatted answers
    const { encryptedData, iv } = encryptResponse(JSON.stringify(formattedAnswers));

    // Calculate unlock time dynamically based on form settings
    const unlockAt = new Date(form.encryptionEndTime);

    // Create new response with ZKP commitment
    const newResponse = new Response({
      form: formId,
      commitment, // Use ZKP commitment instead of user ID
      nullifier, // Store nullifier for additional security
      answers: { encryptedData, iv }, // Store encrypted answers
      unlockAt,
    });

    const savedResponse = await newResponse.save();

    // Create submission tracking
    const submissionTracking = new SubmissionTracking({
      formId,
      submissionHash: commitment,
      nullifier,
    });
    await submissionTracking.save();

    res.status(201).json({
      status: 'success',
      code: 'SUBMISSION_SUCCESSFUL',
      message: 'Response submitted successfully',
      data: {
        responseId: savedResponse._id,
        submittedAt: savedResponse.createdAt,
        unlockAt: savedResponse.unlockAt,
        commitment,
      },
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({
      status: 'error',
      code: 'SUBMISSION_FAILED',
      message: 'Error submitting form response',
      error: error.message,
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

// Fetch all responses for a specific form
router.get('/forms/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params;

    // Find all responses associated with the specified form
    const responses = await Response.find({ form: formId });

    const formattedResponses = responses.map((response) => ({
      decrypted: response.decryptedAnswers !== null, // Check if the response is decrypted
      answers: response.decryptedAnswers || null, // Return decrypted answers if available
      unlockAt: response.unlockAt,
    }));

    res.status(200).json(formattedResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Error fetching responses' });
  }
});

export default router;
