const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    }
});

module.exports = mongoose.model('State', stateSchema);
