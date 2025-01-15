import express from 'express';
import connectDB from './src/database/connectivity.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import FormRoute from './src/database/models/Form/route.js';
import ResponseForm from './src/database/models/ResponseForm/route.js';
import Users from './src/database/models/User/route.js';
import { decryptResponse } from './src/database/models/Encryption/encryption.js'; // Import decryption logic
import Response from './src/database/models/ResponseForm/schema.js'; // Import Response model

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.REACT_APP_API_URL,  // Development URL
  ],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',process.env.REACT_APP_API_URL);  // Change '*' to the allowed origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});


app.use(express.json());
app.use(bodyParser.json());

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url); // Converts the module's URL to a file path
const __dirname = dirname(__filename);

// MongoDB Connection
connectDB();

// Background Task for Unlocking Responses
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled task for unlocking responses...');
  const now = new Date();

  try {
    // Fetch responses that are eligible for decryption
    const responsesToUnlock = await Response.find({
      unlockAt: { $lte: now }, // Check if the unlockAt time has passed
      decryptedAnswers: null, // Only decrypt if not already decrypted
    });

    for (const response of responsesToUnlock) {
      const { encryptedData, iv } = response.answers;
      try {
        const decrypted = decryptResponse(encryptedData, iv); // Decrypt the encrypted response data
        console.log('Decrypted Response:', decrypted);

        // Save decrypted data to the database
        response.decryptedAnswers = JSON.parse(decrypted); // Store the decrypted data
        await response.save(); // Save changes to the database
        console.log(`Response ${response._id} decrypted and saved.`);
      } catch (decryptionError) {
        console.error(`Failed to decrypt response ${response._id}:`, decryptionError);
      }
    }
  } catch (err) {
    console.error('Error during background task for unlocking responses:', err);
  }
});

// Routes
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
