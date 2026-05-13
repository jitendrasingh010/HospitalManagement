const mongoose = require('mongoose');
const subDepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], default: 'active'
    },
}, { timestamps: true });
const SubDepartment = mongoose.model('SubDepartment', subDepartmentSchema);
module.exports = SubDepartment;