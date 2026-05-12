const Citydata = require('../model/cityModel');

exports.addCity = async (req, res) => {
    try {
        const { city, district, state } = req.body;
        if (!city || !district || !state) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingCity = await Citydata.findOne({ city, district, state });
        if (existingCity) {
            return res.status(400).json({ message: 'City already exists in this district and state' });
        }

        const cities = new Citydata({ city, district, state });
        await cities.save();
        res.status(201).json({ message: 'City added successfully', cities });
    } catch (error) {
        console.error('Error adding city:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCity = async (req, res) => {
    try {
        const cities = await Citydata.find().populate('district').populate('state');
        res.status(200).json({ cities });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { city, district, state } = req.body;
        const updatedCity = await Citydata.findByIdAndUpdate(
            id,
            { city, district, state },
            { new: true }
        ).populate('district').populate('state');

        if (!updatedCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({ message: 'City updated successfully', updatedCity });
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCity = await Citydata.findByIdAndDelete(id);
        if (!deletedCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({ message: 'City deleted successfully', deletedCity });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
