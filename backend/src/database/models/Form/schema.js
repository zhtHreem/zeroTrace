const mongoose = require('mongoose');

// Schema for individual options in questions
const OptionSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true
    }
});

// Schema for individual questions
const QuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Checkbox', 'Multiple choice', 'Drop down', 'Short answer', 'Paragraph'],
    },
    order: {
        type: Number,
        required: true
    },
    options: [OptionSchema],
    isRequired: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Main form schema
const FormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [QuestionSchema],
    isPublished: {
        type: Boolean,
        default: false
    },
    allowAnonymous: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for form responses
const ResponseSchema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    respondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
});

// Indexes for better query performance
FormSchema.index({ creator: 1, createdAt: -1 });
FormSchema.index({ isPublished: 1 });
ResponseSchema.index({ form: 1, submittedAt: -1 });
ResponseSchema.index({ respondent: 1 });

// Middleware to update the updatedAt field
FormSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

QuestionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create models
const Form = mongoose.model('Form', FormSchema);
const Response = mongoose.model('Response', ResponseSchema);

module.exports = {
    Form,
    Response
};