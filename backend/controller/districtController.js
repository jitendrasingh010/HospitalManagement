const Districtdata = require('../model/districtModel');

exports.addDistrict = async (req, res) => {
    try {
        const { district, state } = req.body;
        if (!district || !state) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingDistrict = await Districtdata.findOne({ district, state });
        if (existingDistrict) {
            return res.status(400).json({ message: 'District already exists in this state' });
        }

        const districts = new Districtdata({ district, state });
        await districts.save();
        res.status(201).json({ message: 'District added successfully', districts });
    } catch (error) {
        console.error('Error adding district:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getDistrict = async (req, res) => {
    try {
        const districts = await Districtdata.find().populate('state');
        res.status(200).json({ districts });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { district, state } = req.body;
        const updatedDistrict = await Districtdata.findByIdAndUpdate(
            id,
            { district, state },
            { new: true }
        ).populate('state');

        if (!updatedDistrict) {
            return res.status(404).json({ message: 'District not found' });
        }

        res.status(200).json({ message: 'District updated successfully', updatedDistrict });
    } catch (error) {
        console.error('Error updating district:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDistrict = await Districtdata.findByIdAndDelete(id);
        if (!deletedDistrict) {
            return res.status(404).json({ message: 'District not found' });
        }

        res.status(200).json({ message: 'District deleted successfully', deletedDistrict });
    } catch (error) {
        console.error('Error deleting district:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
