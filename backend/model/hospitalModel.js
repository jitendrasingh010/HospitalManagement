const mongoose=require('mongoose');
const hospitalSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    address:{
        type: String,
        required: true
    },
    pincode:{
        type: String,
        required: true
    },
    speciality:{
        type: String,
        required: true
    },

    contact:{
        type: String,
        required: true
    },
      emergencyAvailable: {
        type: Boolean,
        default: false
    },

    numberOfDoctors: {
        type: Number,
        default: 0
    },

    numberOfBeds: {
        type: Number,
        default: 0
    },

    openingTime: {
        type: String
    },

    closingTime: {
        type: String
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    ambulanceService: {
        type: Boolean,
        default: false
    },
   
    establishedYear: {
        type: Number
    },

    description: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    }
});
const hospitalModel=mongoose.model('Hospital',hospitalSchema);
module.exports=hospitalModel;
