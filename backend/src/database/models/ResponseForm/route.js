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

// Response counts for every survey owned by a user (aggregate only)
router.get('/forms/user/:userId/stats', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.json({});
    const forms = await Form.find({ user: req.params.userId }).select('_id');
    const counts = await Response.aggregate([
      { $match: { form: { $in: forms.map((f) => f._id) } } },
      { $group: { _id: '$form', count: { $sum: 1 } } },
    ]);
    res.json(Object.fromEntries(counts.map((c) => [String(c._id), c.count])));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// ───────────────────────── Public results (aggregates only) ─────────────────────────
// Closed surveys publish what everyone said, never who said it. Rules enforced here, not in the UI:
//  - nothing is shown until the unlock time has passed
//  - nothing is broken down until at least MIN_PUBLIC_RESPONSES people answered
//  - choice answers are totals/percentages; written comments only if the creator opted in
const MIN_PUBLIC_RESPONSES = 5;
const CHOICE_TYPES = ['Multiple choice', 'Drop down', 'Checkbox'];

const isUnlocked = (form) => !!form.encryptionEndTime && Date.now() >= new Date(form.encryptionEndTime).getTime();

async function loadAnswerSets(formId) {
  const rows = await Response.find({ form: formId });
  const sets = [];
  for (const r of rows) {
    if (Array.isArray(r.decryptedAnswers)) { sets.push(r.decryptedAnswers); continue; }
    try { sets.push(JSON.parse(decryptResponse(r.answers.encryptedData, r.answers.iv))); }
    catch (e) { console.error('Could not decrypt response', r._id.toString()); }
  }
  return sets;
}

const answered = (a) => a && a.answer !== '' && a.answer != null && !(Array.isArray(a.answer) && a.answer.length === 0);

function summarizeQuestions(form, sets) {
  return form.questions.map((q, qi) => {
    const qid = q._id.toString();
    const given = sets.map((set) => set.find((a) => a.question === qid) || set[qi]).filter(answered);
    const base = { title: q.title, type: q.type, answered: given.length };
    if (CHOICE_TYPES.includes(q.type)) {
      const counts = Object.fromEntries(q.options.map((o) => [o, 0]));
      given.forEach((a) => (Array.isArray(a.answer) ? a.answer : [a.answer]).forEach((v) => { if (v in counts) counts[v] += 1; }));
      return { ...base, options: q.options.map((label) => ({ label, count: counts[label], pct: given.length ? Math.round((counts[label] / given.length) * 100) : 0 })) };
    }
    if (form.showComments) {
      return { ...base, comments: given.map((a) => String(a.answer)).sort((x, y) => x.localeCompare(y)).slice(0, 60) };
    }
    return { ...base, commentsHidden: true };
  });
}

router.get('/forms/:formId/results', async (req, res) => {
  try {
    const { formId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(formId)) return res.status(404).json({ message: 'Survey not found' });
    const form = await Form.findById(formId);
    if (!form || form.status === 'draft') return res.status(404).json({ message: 'Survey not found' });

    const total = await Response.countDocuments({ form: formId });
    const head = { title: form.title, description: form.description, category: form.category, totalResponses: total };

    if (!isUnlocked(form)) return res.json({ ...head, status: 'locked', unlockAt: form.encryptionEndTime });
    if (total < MIN_PUBLIC_RESPONSES) return res.json({ ...head, status: 'too-few', minimum: MIN_PUBLIC_RESPONSES });

    const sets = await loadAnswerSets(formId);
    res.json({ ...head, status: 'open', showComments: !!form.showComments, questions: summarizeQuestions(form, sets) });
  } catch (error) {
    console.error('Error building results:', error);
    res.status(500).json({ message: 'Error building results' });
  }
});

// Recently opened results for the homepage: one headline finding per survey
router.get('/results/featured', async (req, res) => {
  try {
    const forms = await Form.find({ status: { $ne: 'draft' }, encryptionEndTime: { $lte: new Date() } }).sort({ encryptionEndTime: -1 }).limit(12);
    const out = [];
    for (const form of forms) {
      if (out.length === 3) break;
      const total = await Response.countDocuments({ form: form._id });
      if (total < MIN_PUBLIC_RESPONSES) continue;
      const qIndex = form.questions.findIndex((q) => q.type === 'Multiple choice');
      if (qIndex < 0) continue;
      const sets = await loadAnswerSets(form._id);
      const q = summarizeQuestions(form, sets)[qIndex];
      const top = [...q.options].sort((a, b) => b.count - a.count)[0];
      out.push({ _id: form._id, title: form.title, category: form.category, totalResponses: total, question: q.title, topLabel: top.label, topPct: top.pct });
    }
    res.json(out);
  } catch (error) {
    console.error('Error building featured results:', error);
    res.status(500).json({ message: 'Error building featured results' });
  }
});

export default router;
