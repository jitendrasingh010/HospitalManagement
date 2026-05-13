const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    BG:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:''
    },
    role:{
        type:String,
        enum:['superadmin','hospital'],
        default:'hospital'
    },
    hospitalId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
    },
    otp:{
        type:String,
        default:null
    },
    otpExpire:{
        type:Date,
        default:null
    }

});
const userModel=mongoose.model('User',userSchema);
module.exports=userModel;
