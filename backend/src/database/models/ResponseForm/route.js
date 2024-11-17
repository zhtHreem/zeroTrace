// responseRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Response from './schema.js';
import Form from '../Form/schema.js';

const router = express.Router();

router.post('/responses', async (req, res) => {
    try {
        const { formId, responses, user } = req.body;
        const newResponse = new Response({
            formId,
            responses,
            user
        });
        const savedResponse = await newResponse.save();
        res.status(201).json(savedResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


export default router;
