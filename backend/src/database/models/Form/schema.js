// models/Form.js
import mongoose from 'mongoose';

// Define the question schema
const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    options: { type: [String], default: [] },
    newOption: { type: String, default: "" },
    required: { type: Boolean, default: false }
});

// Define the form schema
const formSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },
    user: { 
        type: String,  // mongoose.Schema.Types.ObjectId, 
       // ref: 'User', // Assuming you have a User model
        required: true 
    },
    decryptionTime: {
        type: Number,
        required: true,
        min: 1
    },
    decryptionUnit: {
        type: String,
        required: true,
        enum: ['seconds', 'minutes', 'hours', 'days'],
        default: 'hours'
    }
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
export default Form;





