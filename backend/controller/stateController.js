const Statedata = require('../model/stateModel');
exports.addState=  async (req, res) => {
        try {
            const { state } = req.body;
            if (!state) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            const existingState = await Statedata.findOne({ state });
            if (existingState) {
                return res.status(400).json({ message: 'State already exists' });
            }
            const states = new Statedata({ state, country: 'India' });
            await states.save();
            res.status(201).json({ message: 'State added successfully' });
        } catch (error) {
            console.error('Error adding state:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    exports.getState = async (req, res) => {
        try {
            const states = await Statedata.find();
            res.status(200).json({ states });
        } catch (error) {
            console.error('Error fetching states:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    exports.updateState = async (req, res) => {
        try {
            const { id } = req.params;
            const { state } = req.body;
            const updatedState = await Statedata.findByIdAndUpdate(id, { state, country: 'India' }, { new: true });
            if (!updatedState) {
                return res.status(404).json({ message: 'State not found' });
            }
            res.status(200).json({ message: 'State updated successfully', updatedState });
        } catch (error) {
            console.error('Error updating state:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    exports.deleteState = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedState = await Statedata.findByIdAndDelete(id);
            if (!deletedState) {
                return res.status(404).json({ message: 'State not found' });
            }
            res.status(200).json({ message: 'State deleted successfully', deletedState });
        } catch (error) {
            console.error('Error deleting state:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
