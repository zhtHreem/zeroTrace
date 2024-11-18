// responseSchema.js
import mongoose from 'mongoose';


const responseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  user: {
   // type: mongoose.Schema.Types.ObjectId,
   // ref: 'User',
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

export default Response;