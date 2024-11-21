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

  answers: {
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
  },

  decryptedAnswers: {
    type: [mongoose.Schema.Types.Mixed], // Store arrays or strings for questions
    default: null},
  unlockAt: { type: Date, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const Response = mongoose.model('Response', responseSchema);


const SubmissionTracking = mongoose.model('SubmissionTracking', submissionTrackingSchema);

export default Response;
export  {Response,SubmissionTracking};
