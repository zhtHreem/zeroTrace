import express from 'express';
import connectDB from './src/database/connectivity.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import FormRoute from './src/database/models/Form/route.js';
import ResponseForm from './src/database/models/ResponseForm/route.js';
import Users from './src/database/models/User/route.js';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB Connection
connectDB();

// Encryption Logic
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Retrieve key from .env
const IV_LENGTH = 16; // IV length for AES encryption

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error('Invalid ENCRYPTION_KEY. Ensure it is 256 bits and set in the .env file.');
  process.exit(1);
}

function encryptResponse(response) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(response, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

function decryptResponse(encrypted, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// MongoDB Schema
const surveyResponseSchema = new mongoose.Schema({
  response: { type: String, required: true }, // Encrypted response
  surveyId: { type: String, required: true }, // Survey ID
  createdAt: { type: Date, default: Date.now }, // Timestamp
  unlockAt: { type: Date, required: true }, // Unlock time
  decrypted: { type: String }, // Store decrypted data
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// Background Task for Unlocking Responses
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled task for unlocking responses...');
  const now = new Date();

  const responsesToUnlock = await SurveyResponse.find({
    unlockAt: { $lte: now },
    decrypted: { $exists: false }, // Only decrypt if not already decrypted
  });

  for (const response of responsesToUnlock) {
    try {
      const { encryptedData, iv } = JSON.parse(response.response);
      const decrypted = decryptResponse(encryptedData, iv);
      console.log(`Unlocked Response (ID: ${response._id}):`, decrypted);

      // Save decrypted data to the database
      response.decrypted = decrypted;
      await response.save();
    } catch (err) {
      console.error('Failed to decrypt response:', response._id, err);
    }
  }
});

// Routes
app.post('/submit', async (req, res) => {
  try {
    const { response, surveyId } = req.body;

    const { encryptedData, iv } = encryptResponse(response);

    const unlockAt = new Date();
    unlockAt.setMinutes(unlockAt.getMinutes() + 10);

    const newResponse = new SurveyResponse({
      response: JSON.stringify({ encryptedData, iv }),
      surveyId,
      unlockAt,
    });

    await newResponse.save();
    res.status(201).send('Survey response submitted. Unlocks in 10 minutes.');
  } catch (err) {
    console.error('Error submitting survey response:', err);
    res.status(500).json({ error: 'Failed to submit survey response' });
  }
});

app.get('/decrypt/:id', async (req, res) => {
  try {
    const objectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).send('Invalid ObjectId.');
    }

    const surveyResponse = await SurveyResponse.findById(objectId);
    if (!surveyResponse) {
      return res.status(404).send('Response not found.');
    }

    if (new Date() < new Date(surveyResponse.unlockAt)) {
      return res.status(403).send('Response is still locked.');
    }

    if (!surveyResponse.decrypted) {
      const { encryptedData, iv } = JSON.parse(surveyResponse.response);
      const decrypted = decryptResponse(encryptedData, iv);

      // Save decrypted data to the database
      surveyResponse.decrypted = decrypted;
      await surveyResponse.save();
    }

    res.status(200).send({ decryptedResponse: surveyResponse.decrypted });
  } catch (err) {
    console.error('Error decrypting survey response:', err);
    res.status(500).json({ error: 'Failed to decrypt survey response' });
  }
});

app.get('/', (req, res) => res.send('API is running successfully'));

// Additional Routes
app.use('/api', Users);
app.use('/api', FormRoute);
app.use('/api', ResponseForm);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
