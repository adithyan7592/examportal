import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  
      required: [true, 'Student is required'],
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Question is required'],
    },
    answer: {
      type: Number,  
      required: [true, 'Answer is required'], 
      min: [0, 'Answer must be a valid option index (0-3)'], 
      max: [3, 'Answer must be a valid option index (0-3)'], 
    },
    isCorrect: {
      type: Boolean, 
      default: false,
    },
    quizTitle: {
      type: String,
      required: true, // If you want this to be required
    },
  },
  { timestamps: true }
);

// Before saving the answer, you can fetch the quizTitle from the related Question
answerSchema.pre('save', async function(next) {
  const question = await mongoose.model('Question').findById(this.question);
  this.quizTitle = question.quizTitle; // Set the quizTitle based on the related question
  next();
});

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
