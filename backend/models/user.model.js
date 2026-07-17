import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
name:
{
    type:String,
    required:true
},
email:
{
    type:String,
    required:true,
    unique:true
},
password:
{
    type:String,
    required:true
},
assistantName:
{
    type:String
},
assistantImage:
{
    type:String
},
assistantVoice:
{
    type:String,
    default:"female"
},
history:[{type:String}],
notes:[
  {
    title: { type: String },
    syllabus: { type: String, required: true },
    difficulty: { type: String, required: true },
    marks: { type: Number, required: true },
    numQuestions: { type: Number },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
]


},{timestamps:true})


const user=mongoose.model("user",userSchema);

export default user