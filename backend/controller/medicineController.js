const Medicine = require('../model/medicineModel');

exports.addMedicine = async (req, res) => {
    try {
        const {
            appointmentId,
            patientId,
            doctorId,
            hospitalId,
            name,
            description,
            dosage,
            timing,
            duration,
            quantity,
            price,
            instructions
        } = req.body;

        if (!appointmentId || !patientId || !doctorId || !hospitalId || !name || !dosage || !timing || !duration) {
            return res.status(400).json({ message: 'Appointment, patient, doctor, hospital, medicine, dosage, timing and duration are required' });
        }

        const medicineQuantity = Number(quantity || 1);
        const medicinePrice = Number(price || 0);

        const medicine = await Medicine.create({
            appointmentId,
            patientId,
            doctorId,
            hospitalId,
            name,
            description,
            dosage,
            timing,
            duration,
            quantity: medicineQuantity,
            price: medicinePrice,
            totalPrice: medicineQuantity * medicinePrice,
            instructions,
            isReached: true
        });

        res.status(201).json({ message: 'Medicine added successfully', medicine });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAppointmentMedicines = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const medicines = await Medicine.find({
            appointmentId,
            patientId: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Medicine details',
            medicines
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
