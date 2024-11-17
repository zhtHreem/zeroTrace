// Create a new form
const express = require('express');
const router = express.Router();
const { Form, Response } = require('./schema.js');
const mongoose = require('mongoose');

// Middleware for checking if the form exists
const checkFormExists = async (req, res, next) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        req.form = form;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a new form
router.post('/forms', async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        
        // Add order to questions
        const questionsWithOrder = questions.map((q, index) => ({
            ...q,
            order: index
        }));

        const form = new Form({
            title,
            description,
            creator: req.user._id, // Assuming you have authentication middleware
            questions: questionsWithOrder
        });

        await form.save();
        res.status(201).json(form);
    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ 
            error: 'Failed to create form',
            details: error.message 
        });
    }
});

// Get all forms for the current user
router.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find({ creator: req.user._id })
            .sort({ createdAt: -1 })
            .select('title description isPublished createdAt');
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Get a specific form by ID
router.get('/forms/:formId', checkFormExists, async (req, res) => {
    res.json(req.form);
});

// Update a form
router.put('/forms/:formId', checkFormExists, async (req, res) => {
    try {
        const { title, description, questions, isPublished } = req.body;
        
        // Ensure the user owns the form
        if (req.form.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update the form
        const updatedForm = await Form.findByIdAndUpdate(
            req.params.formId,
            {
                title,
                description,
                questions: questions.map((q, index) => ({ ...q, order: index })),
                isPublished,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json(updatedForm);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update form' });
    }
});

// Delete a form
router.delete('/forms/:formId', checkFormExists, async (req, res) => {
    try {
        // Ensure the user owns the form
        if (req.form.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Form.findByIdAndDelete(req.params.formId);
        // Also delete all responses for this form
        await Response.deleteMany({ form: req.params.formId });
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

// Submit a response to a form
router.post('/forms/:formId/submit', checkFormExists, async (req, res) => {
    try {
        const { answers } = req.body;
        
        // Validate if form is published and within date range
        if (!req.form.isPublished) {
            return res.status(400).json({ error: 'Form is not published' });
        }

        if (req.form.endDate && new Date() > req.form.endDate) {
            return res.status(400).json({ error: 'Form submission period has ended' });
        }

        // Create the response
        const response = new Response({
            form: req.form._id,
            respondent: req.user ? req.user._id : null,
            answers,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        await response.save();
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit response' });
    }
});

// Get form responses (only for form creator)
router.get('/forms/:formId/responses', checkFormExists, async (req, res) => {
    try {
        // Ensure the user owns the form
        if (req.form.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const responses = await Response.find({ form: req.params.formId })
            .sort({ submittedAt: -1 })
            .populate('respondent', 'name email');  // If you want to include respondent details

        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

// Get response statistics for a form
router.get('/forms/:formId/stats', checkFormExists, async (req, res) => {
    try {
        // Ensure the user owns the form
        if (req.form.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const stats = await Response.aggregate([
            { $match: { form: mongoose.Types.ObjectId(req.params.formId) } },
            { $group: {
                _id: null,
                totalResponses: { $sum: 1 },
                averageTimeToComplete: { 
                    $avg: { $subtract: ['$submittedAt', '$createdAt'] }
                }
            }}
        ]);

        res.json(stats[0] || { totalResponses: 0, averageTimeToComplete: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;