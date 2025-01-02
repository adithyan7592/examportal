import mongoose from "mongoose";

const userschema = new mongoose.Schema({

fullname:{
    type:String,
    required:true,
},
email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true
},
password:{
    type:String,
    required:true,
    minlength: [6, 'Password must be at least 6 characters long'],

},
role: { type: String, enum: ["teacher", "student"], required: true },
})
const User = mongoose.model('User', userschema);
export default User;