import express from 'express';
import bcrypt from 'bcryptjs';
import User from './schema.js'; 
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password, googleId, name } = req.body;
  
    try {
      let user = await User.findOne({ email });
  
      if (googleId) {
        // Google login
        if (!user) {
          // Check for conflicts with the unique googleId field
          const existingGoogleUser = await User.findOne({ googleId });
          if (existingGoogleUser) {
            return res.status(400).json({ error: 'Google ID already exists' });
          }
  
          // Create new user if they don’t exist
          user = new User({ email, googleId, name });
          await user.save();
        } else if (!user.googleId) {
          // Update existing user with Google ID if not already set
          user.googleId = googleId;
          await user.save();
        }
  
        return res.status(200).json({ message: 'Google login successful', user });
      } else {
        // Regular login
        if (!user) {
          if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
          }
  
          user = new User({ email, password });
          await user.save();
          return res.status(201).json({ message: 'User created and logged in successfully', user });
        } else {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
          }
          return res.status(200).json({ message: 'Login successful', user });
        }
      }
    } catch (error) {
      console.error('Error in login endpoint:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  // Get a specific form by ID
router.get('/user/:Id', async (req, res) => {
    try {
        const user = await User.findById(req.params.Id);
        if (!user) {
            return res.status(404).json({ message: 'Form not found' });
        }
       // res.json(form);
       res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ message: 'Error fetching form', error: error.message });
    }
});


export default router;