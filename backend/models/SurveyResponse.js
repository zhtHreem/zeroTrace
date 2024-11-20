const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
  response: { type: String, required: true },
  surveyId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  unlockAt: { type: Date, required: true },
});

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
