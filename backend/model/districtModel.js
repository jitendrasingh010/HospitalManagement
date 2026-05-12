const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
    district: {
        type: String,
        required: true
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }
});

module.exports = mongoose.model('District', districtSchema);
