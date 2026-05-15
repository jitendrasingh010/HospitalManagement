const mongoose = require('mongoose');

const hospitalImgSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    img: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('HospitalImg', hospitalImgSchema);
