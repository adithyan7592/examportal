import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [arrayLimit, 'Options array must have exactly 4 items.'],
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3, // The valid indices for options array are 0, 1, 2, 3
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examDuration: {
      type: Number,
      required: true, // Ensure that examDuration is always provided
    },
  },
  { timestamps: true }
);

// Validation for the options array length
function arrayLimit(val) {
  return val.length === 4;
}

const Question = mongoose.model('Question', questionSchema);
export default Question;
