// responseRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import {Response,SubmissionTracking } from './schema.js';
import Form from '../Form/schema.js';
import crypto from 'crypto';

const router = express.Router();


// Function to create a one-way hash of user+form combination
const createSubmissionHash = (userId, formId) => {
  return crypto
    .createHash('sha256')
    .update(`${userId}-${formId}`)
    .digest('hex');
};


// Function to create anonymous identifier
const createAnonymousId = (userId) => {
  return crypto
    .createHash('sha256')
    .update(userId)
    .digest('hex');
};

router.post('/responses', async (req, res) => {
     const session = await mongoose.startSession();
     session.startTransaction();

    

  try {
    console.log("Body",req.body);

    const { formId, responses, user } = req.body;
    console.log("check",responses['673a5b8cf116641bb0219bd1'])

    

    if (!formId || !responses || !user) {
      return res.status(400).json({ message: 'formId, responses, and user are required' });
    }



     // Create submission hash
    const submissionHash = createSubmissionHash(user, formId);

    // Check if user has already submitted
    const existingSubmission = await SubmissionTracking.findOne({ submissionHash });
    if (existingSubmission) {
      return res.status(409).json({ 
        status: 'error',
        code: 'DUPLICATE_SUBMISSION',
        message: 'You have already submitted a response for this form',
        submittedAt: existingSubmission.submittedAt
      });
    }



    // Fetch the form to get question details
    const form = await Form.findById(formId);
    console.log("FORMM",form)
    if (!form) {
      return res.status(404).json({
        status: 'error',
        code: 'FORM_NOT_FOUND',
        message: 'Form not found'  
        });
    }


    // Create anonymized identifier for the user
    const anonymousId = createAnonymousId(user);


    // Format answers with question details
    const formattedAnswers = form.questions.map(question => ({
      question: question._id.toString(),
      questionTitle: question.title,
      answer: responses[question._id.toString()] || '',
      questionType: question.type
    }));
        console.log("format",formattedAnswers)

    // Create new response
    const newResponse = new Response({
      form: formId,
      user: anonymousId, //user,
      answers: formattedAnswers
    });
    //if (!formId || !formattedAnswers || !user) {
  //return res.status(400).json({ message: 'formId, responses, and user are required' });
//}
   
     // Track the submission
    const submissionTracking = new SubmissionTracking({
      formId,
      submissionHash
    });


        console.log("id",formId,"user",user,"asnswer",formattedAnswers)  
        console.log("nformat",newResponse)

   // await newResponse.save();
   // res.status(201).json(newResponse);


    await Promise.all([
      newResponse.save({ session }),
      submissionTracking.save({ session })
    ]);



    await session.commitTransaction();
    res.status(201).json({ 
      status: 'success',
      code: 'SUBMISSION_SUCCESSFUL',
      message: 'Response submitted successfully',
      data: {
        responseId: newResponse._id,
        submittedAt: newResponse.submittedAt
      }
    });


  } catch (error) {
   // console.error('Error submitting response:', error);
   // res.status(500).json({ message: 'Error submitting form response' });
    await session.abortTransaction();
    console.error('Error submitting response:', error);
    res.status(500).json({ 
        status: 'error',
      code: 'SUBMISSION_FAILED',
      message: 'Error submitting form response',
      error: error.message
     });
  } finally {
    session.endSession();
  }

  
});

export default router;
