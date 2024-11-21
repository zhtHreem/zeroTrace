// responseSchema.js
import mongoose from 'mongoose';


// Schema to track unique submissions using hashed identifiers
const submissionTrackingSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  // Stores commitment combination
  submissionHash: {
    type: String,
    required: true,
    unique: true
  },
  nullifier: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const responseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  } ,

  commitment: {
    type: String,
    required: true,
    unique: true
  },
  nullifier: {
    type: String,
    required: true
  },
  answers: [{
    question: {
      type: String, // This will store the question id
      required: true
    },
    questionTitle: String, // Store the question title for easier retrieval
    answer: mongoose.Schema.Types.Mixed, // Can store string or array based on question type
    questionType: String // Store question type for context
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Response = mongoose.model('Response', responseSchema);
const SubmissionTracking = mongoose.model('SubmissionTracking', submissionTrackingSchema);

export  {Response,SubmissionTracking};