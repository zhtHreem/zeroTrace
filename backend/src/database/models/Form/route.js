import express from 'express';
import Form from './schema.js'; // Import the Form model using ES modules

const router = express.Router();

// POST route to save a form
router.post('/forms', async (req, res) => {
    const { category, title, description, questions, user, decryptionTime, decryptionUnit } = req.body;
    console.log('Form data received:', req.body);

    try {
        // Create a new form using the data from the request
        const newForm = new Form({
            category,
            title,
            description,
            questions,
            user,
            decryptionTime,
            decryptionUnit,
        });

        // Save the form to the database
        await newForm.save();
        res.status(201).json({ message: 'Form saved successfully', form: newForm });
    } catch (error) {
        console.error('Error saving form:', error);
        res.status(500).json({ message: 'Error saving form', error: error.message });
    }
});

// GET route to fetch all forms
router.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find();
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ error: `Error fetching titles: ${error.message}` });
    }
});

// Get a specific form by ID
router.get('/forms/:formId', async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ message: 'Error fetching form', error: error.message });
    }
});

// Get all forms for a user
router.get('/forms/user/:userId', async (req, res) => {
    try {
        const forms = await Form.find({ user: req.params.userId }).sort({ createdAt: -1 });
        console.log('for', forms);
        res.json(forms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ message: 'Error fetching forms', error: error.message });
    }
});

// Activate a form
router.post('/forms/activate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const activationTime = new Date();

        // Update the form with activation status and calculate encryption end time
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft forms can be activated.' });
        }

        // Calculate encryption end time based on decryptionTime and decryptionUnit
        const decryptionUnitToMilliseconds = {
            seconds: 1000,
            minutes: 60 * 1000,
            hours: 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000,
        };

        const encryptionEndTime = new Date(
            activationTime.getTime() + form.decryptionTime * decryptionUnitToMilliseconds[form.decryptionUnit]
        );

        form.status = 'active';
        form.activationTime = activationTime;
        form.encryptionEndTime = encryptionEndTime;
        await form.save();

        res.json({ message: 'Form activated successfully', form });
    } catch (error) {
        console.error('Error activating form:', error);
        res.status(500).json({ error: 'Failed to activate form' });
    }
});

// Validate form status before submission
router.post('/forms/:formId/responses', async (req, res) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;

        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Check if the form is active
        if (form.status !== 'active') {
            return res.status(403).json({ error: 'Form is not active. Submissions are not allowed.' });
        }

        // Check if the encryption end time has passed
        const now = new Date();
        if (form.encryptionEndTime && now > form.encryptionEndTime) {
            form.status = 'closed';
            await form.save();
            return res.status(403).json({ error: 'Form is closed. Submissions are not allowed.' });
        }

        // Process the response submission (encryption logic to be implemented elsewhere)
        // Assuming encryption happens here
        const encryptedResponse = encryptResponse(JSON.stringify(answers));
        const response = new Response({
            form: formId,
            answers: encryptedResponse,
            unlockAt: form.encryptionEndTime,
        });

        await response.save();
        res.status(201).json({ message: 'Response submitted successfully', response });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: 'Failed to submit response' });
    }
});

export default router;
