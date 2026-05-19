const mongoose=require('mongoose');
const testSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    labId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    status:{
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });
const Test=mongoose.model('Test', testSchema);
module.exports=Test;
