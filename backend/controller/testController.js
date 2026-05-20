
const Test = require('../model/testModel');
const Lab = require('../model/labModel');

const getTestFilter = async (req, id) => {
    if (req.user.role === 'lab') {
        return { _id: id, labId: req.user.labId };
    }

    if (req.user.role === 'hospital') {
        const labs = await Lab.find({ hospitalID: req.user.hospitalId }).select('_id');
        return { _id: id, labId: { $in: labs.map((lab) => lab._id) } };
    }

    return { _id: id };
};

exports.addtest=async(req,res)=>{
    try {
        const { name, price, labId } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        let testLabId = req.user.labId;

        if (req.user.role === 'hospital') {
            if (!labId) {
                return res.status(400).json({ message: 'Please select lab' });
            }

            const lab = await Lab.findOne({ _id: labId, hospitalID: req.user.hospitalId });

            if (!lab) {
                return res.status(404).json({ message: 'Lab not found' });
            }

            testLabId = labId;
        }

        if (!testLabId) {
            return res.status(403).json({ message: 'Only lab or hospital can add test' });
        }

        const test = new Test({ name, price, labId: testLabId });
        await test.save();
        res.status(201).json({ message: 'Test added successfully', test });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.gettest=async(req,res)=>{
    try {
        let tests = [];

        if (req.user.role === 'lab') {
            tests = await Test.find({ labId: req.user.labId })
                .populate('labId', 'name')
                .sort({ _id: -1 });

            return res.status(200).json({ message: 'Tests loaded successfully', tests });
        }

        if (req.user.role === 'hospital' || req.user.role === 'doctor') {
            const labs = await Lab.find({ hospitalID: req.user.hospitalId }).select('_id');

            for (const lab of labs) {
                const labTests = await Test.find({ labId: lab._id })
                    .populate('labId', 'name')
                    .sort({ _id: -1 });

                tests = [...tests, ...labTests];
            }

            return res.status(200).json({ message: 'Tests loaded successfully', tests });
        }

        res.status(403).json({ message: 'Only hospital, doctor or lab can get tests' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updatetest=async(req,res)=>{
    try {
        const { id } = req.params;
        const { name, price, status, labId } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const updateData = { name, price, status };

        if (req.user.role === 'hospital') {
            if (!labId) {
                return res.status(400).json({ message: 'Please select lab' });
            }

            const lab = await Lab.findOne({ _id: labId, hospitalID: req.user.hospitalId });

            if (!lab) {
                return res.status(404).json({ message: 'Lab not found' });
            }

            updateData.labId = labId;
        }

        const test = await Test.findOneAndUpdate(
            await getTestFilter(req, id),
            updateData,
            { new: true }
        );

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test updated successfully', test });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deletetest=async(req,res)=>{
    try {
        const { id } = req.params;
        const test = await Test.findOneAndDelete(await getTestFilter(req, id));
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.softdelete=async(req,res)=>{
    try {
        const { id } = req.params;
        const test = await Test.findOneAndUpdate(
            await getTestFilter(req, id),
            { status: 'inactive' },
            { new: true }
        );
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test soft deleted successfully', test });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.restoretest=async(req,res)=>{
    try {
        const { id } = req.params;
        const test = await Test.findOneAndUpdate(
            await getTestFilter(req, id),
            { status: 'active' },
            { new: true }
        );
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test restored successfully', test });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
