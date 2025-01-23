import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizTitle: { type: String, required: true }, 
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctOption: { type: Number, required: true },
  examDuration: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});


const Question = mongoose.model('Question', questionSchema);
export default Question;



