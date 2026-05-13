const SubDepartment = require('../model/subdepartmentModel');
const Department = require('../model/departmentModel');

exports.addSubDepartment = async (req, res) => {
    try {
        const { name, departmentId } = req.body;

        if (!name || !departmentId) {
            return res.status(400).json({ message: 'Name and department are required' });
        }

        const department = await Department.findOne({ _id: departmentId, hospital: req.user.hospitalId });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const subDepartment = new SubDepartment({ name, departmentId });
        await subDepartment.save();
        res.status(201).json({ message: 'Sub department added successfully', subDepartment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSubDepartment = async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.hospitalId }).select('_id');
        const departmentIds = departments.map((item) => item._id);
        const subDepartments = await SubDepartment.find({ departmentId: { $in: departmentIds } })
            .populate('departmentId')
            .sort({ _id: -1 });

        res.status(200).json({ message: 'Sub departments retrieved successfully', subDepartments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSubDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, departmentId } = req.body;

        if (!name || !departmentId) {
            return res.status(400).json({ message: 'Name and department are required' });
        }

        const department = await Department.findOne({ _id: departmentId, hospital: req.user.hospitalId });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const subDepartment = await SubDepartment.findByIdAndUpdate(id, { name, departmentId }, { new: true });
        if (!subDepartment) {
            return res.status(404).json({ message: 'Sub department not found' });
        }

        res.status(200).json({ message: 'Sub department updated successfully', subDepartment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSubDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const subDepartment = await SubDepartment.findByIdAndDelete(id);

        if (!subDepartment) {
            return res.status(404).json({ message: 'Sub department not found' });
        }

        res.status(200).json({ message: 'Sub department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.softDeleteSubDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const subDepartment = await SubDepartment.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });

        if (!subDepartment) {
            return res.status(404).json({ message: 'Sub department not found' });
        }

        res.status(200).json({ message: 'Sub department inactive successfully', subDepartment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.restoreSubDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const subDepartment = await SubDepartment.findByIdAndUpdate(id, { status: 'active' }, { new: true });

        if (!subDepartment) {
            return res.status(404).json({ message: 'Sub department not found' });
        }

        res.status(200).json({ message: 'Sub department active successfully', subDepartment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
