// responseSchema.js
import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    responses: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    user: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Response = mongoose.model('Response', responseSchema);

export default Response;