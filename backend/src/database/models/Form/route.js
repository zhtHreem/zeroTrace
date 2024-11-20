// routes/formRoutes.js
import express from 'express';
import Form from './schema.js'; // Import the Form model using ES modules

const router = express.Router();



// POST route to save a form
router.post('/forms', async (req, res) => {
    const { title, description, questions,user,decryptionTime,decryptionUnit } = req.body;
    console.log('Form data received:', req.body);

    try {
        // Create a new form using the data from the request
        const newForm = new Form({
            title,
            description,
            questions,
            user,decryptionTime,decryptionUnit
          
        });

        // Save the form to the database
        await newForm.save();
        res.status(201).json({ message: 'Form saved successfully', form: newForm });
    } catch (error) {
        console.error('Error saving form:', error);
        res.status(500).json({ message: 'Error saving form', error: error.message });
    }
});

// Get a specific form by ID
router.get('/forms/:formId', async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.json(form);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ message: 'Error fetching form', error: error.message });
    }
});


// Get all forms for a user
router.get('/forms/user/:userId',  async (req, res) => {
    try {
        const forms = await Form.find({ user: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ message: 'Error fetching forms', error: error.message });
    }
});
export default router;
