// responseRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import { Response, SubmissionTracking } from './schema.js';
import Form from '../Form/schema.js';
import { encryptResponse, decryptResponse } from '../Encryption/encryption.js'; // Encryption logic
import crypto from 'crypto';

const router = express.Router();

// Function to create a one-way hash of user+form combination
const createSubmissionHash = (userId, formId) => {
  return crypto
    .createHash('sha256')
    .update(`${userId}-${formId}`)
    .digest('hex');
};

// Function to create an anonymous identifier
const createAnonymousId = (userId) => {
  return crypto
    .createHash('sha256')
    .update(userId)
    .digest('hex');
};

// Submit a response
router.post('/responses', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { formId, responses, user } = req.body;

    if (!formId || !responses || !user) {
      return res.status(400).json({ message: 'formId, responses, and user are required' });
    }

    // Create submission hash
    const submissionHash = createSubmissionHash(user, formId);

    // Check if user has already submitted
    const existingSubmission = await SubmissionTracking.findOne({ submissionHash });
    if (existingSubmission) {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_SUBMISSION',
        message: 'You have already submitted a response for this form',
        submittedAt: existingSubmission.submittedAt
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

    // Create anonymized identifier for the user
    const anonymousId = createAnonymousId(user);

    // Format answers with question details
    const formattedAnswers = form.questions.map(question => ({
      question: question._id.toString(),
      questionTitle: question.title,
      answer: responses[question._id.toString()] || '',
      questionType: question.type
    }));

    // Encrypt the formatted answers
    const { encryptedData, iv } = encryptResponse(JSON.stringify(formattedAnswers));

    // Set unlock time (e.g., 10 minutes from now)
    const unlockAt = new Date();
    unlockAt.setMinutes(unlockAt.getMinutes() + 10);

    // Create new response
    const newResponse = new Response({
      form: formId,
      user: anonymousId, // Anonymized user ID
      answers: { encryptedData, iv }, // Store encrypted answers
      unlockAt
    });

    // Track the submission
    const submissionTracking = new SubmissionTracking({
      formId,
      submissionHash
    });

    // Save the response and submission tracking atomically
    await Promise.all([
      newResponse.save({ session }),
      submissionTracking.save({ session })
    ]);

    await session.commitTransaction();
    res.status(201).json({
      status: 'success',
      code: 'SUBMISSION_SUCCESSFUL',
      message: 'Response submitted successfully',
      data: {
        responseId: newResponse._id,
        submittedAt: newResponse.submittedAt
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error submitting response:', error);
    res.status(500).json({
      status: 'error',
      code: 'SUBMISSION_FAILED',
      message: 'Error submitting form response',
      error: error.message
    });
  } finally {
    session.endSession();
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
