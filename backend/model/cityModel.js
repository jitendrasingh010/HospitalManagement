const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }
});

module.exports = mongoose.model('City', citySchema);
