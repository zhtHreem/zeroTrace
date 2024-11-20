// responseRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Response from './schema.js';
import Form from '../Form/schema.js';
import { encryptResponse, decryptResponse } from '../Encryption/encryption.js'; // Import encryption logic

const router = express.Router();

router.post('/responses', async (req, res) => {
  try {
    const { formId, responses, user } = req.body;

    // Fetch the form to get question details
    const form = await Form.findById(formId);
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

    // Encrypt the formatted answers
    const { encryptedData, iv } = encryptResponse(JSON.stringify(formattedAnswers));

    // Set unlock time (e.g., 10 minutes from now)
    const unlockAt = new Date();
    unlockAt.setMinutes(unlockAt.getMinutes() + 10);

    // Create new response
    const newResponse = new Response({
      form: formId,
      user: user,
      answers: { encryptedData, iv }, // Store encrypted data
      unlockAt,
    });

    await newResponse.save();
    res.status(201).json({ message: 'Response submitted successfully. Unlocks in 10 minutes.', id: newResponse._id });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Error submitting form response' });
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
