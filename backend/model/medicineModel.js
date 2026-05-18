const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dosage: {
        type: String,
        required: true
    },
    timing: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    instructions: {
        type: String
    },
    isReached: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
