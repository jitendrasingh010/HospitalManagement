const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    age: {
        type: Number
    },
    specialization: {
        type: String,
        required: true
    },

    subDepartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubDepartment",
        required: true
    },
    experience: {
        type: Number
    },
    qualification: {
        type: String
    },
    fees: {
        type: Number
    },
    availableDays: [{
        type: String
    }],
    availableTime: {
        start: {
            type: String
        },
        end: {
            type: String
        }
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },
    image: {
        type: String
    },
    about: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
