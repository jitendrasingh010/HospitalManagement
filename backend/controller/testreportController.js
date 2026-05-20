const Report = require('../model/reortModel');
const Medicine = require('../model/medicineModel');
const Test = require('../model/testModel');
const Lab = require('../model/labModel');

const getLabIds = async (req) => {
    if (req.user.role === 'lab') {
        return req.user.labId ? [req.user.labId] : [];
    }

    if (req.user.role === 'hospital') {
        const labs = await Lab.find({ hospitalID: req.user.hospitalId }).select('_id');
        return labs.map((lab) => lab._id);
    }

    return [];
};

exports.getPendingTests = async (req, res) => {
    try {
        const labIds = await getLabIds(req);

        if (labIds.length === 0) {
            return res.status(403).json({ message: 'Only lab or hospital can see pending tests' });
        }

        const tests = await Test.find({ labId: { $in: labIds } }).select('_id');
        const testIds = tests.map((test) => test._id);

        const medicines = await Medicine.find({ test: { $in: testIds } })
            .populate('patientId', 'name email phone age gender')
            .populate('doctorId', 'name specialization')
            .populate('hospitalId', 'name')
            .populate({
                path: 'test',
                select: 'name price labId',
                populate: { path: 'labId', select: 'name' }
            })
            .sort({ createdAt: -1 });

        const reports = await Report.find({ medicineId: { $in: medicines.map((item) => item._id) } }).select('medicineId');
        const completedIds = reports.map((item) => item.medicineId.toString());
        const pendingTests = medicines.filter((item) => !completedIds.includes(item._id.toString()));

        res.status(200).json({ message: 'Pending tests loaded', pendingTests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addTestReport = async (req, res) => {
    try {
        const { medicineId, result, normalRange, remark, image } = req.body;

        if (!medicineId || !result) {
            return res.status(400).json({ message: 'Medicine and result are required' });
        }

        const medicine = await Medicine.findById(medicineId).populate('test');

        if (!medicine) {
            return res.status(404).json({ message: 'Test request not found' });
        }

        const labIds = await getLabIds(req);
        const testLabId = medicine.test?.labId?.toString();
        const canAdd = labIds.some((id) => id.toString() === testLabId);

        if (!canAdd) {
            return res.status(403).json({ message: 'You cannot add report for this test' });
        }

        const oldReport = await Report.findOne({ medicineId });

        if (oldReport) {
            return res.status(400).json({ message: 'Report already added for this test' });
        }

        const report = await Report.create({
            medicineId,
            appointmentId: medicine.appointmentId,
            patientId: medicine.patientId,
            doctorId: medicine.doctorId,
            hospitalId: medicine.hospitalId,
            testId: medicine.test._id,
            labId: medicine.test.labId,
            result,
            normalRange,
            remark,
            image,
            status: 'completed'
        });

        res.status(201).json({ message: 'Test report added successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTestReports = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'lab' || req.user.role === 'hospital') {
            const labIds = await getLabIds(req);
            filter = { labId: { $in: labIds } };
        } else if (req.user.role === 'doctor') {
            filter = { doctorId: req.user.doctorId };
        } else if (req.user.role === 'user') {
            filter = { patientId: req.user._id };
        } else {
            return res.status(403).json({ message: 'You cannot see reports' });
        }

        const reports = await Report.find(filter)
            .populate('patientId', 'name email phone age gender')
            .populate('doctorId', 'name specialization')
            .populate('hospitalId', 'name')
            .populate('testId', 'name price')
            .populate('labId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ message: 'Reports loaded successfully', reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTestReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { result, normalRange, remark, image } = req.body;

        if (!result) {
            return res.status(400).json({ message: 'Result is required' });
        }

        const labIds = await getLabIds(req);
        const report = await Report.findOneAndUpdate(
            { _id: id, labId: { $in: labIds } },
            { result, normalRange, remark, image },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report updated successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTestReport = async (req, res) => {
    try {
        const { id } = req.params;
        const labIds = await getLabIds(req);
        const report = await Report.findOneAndDelete({ _id: id, labId: { $in: labIds } });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
