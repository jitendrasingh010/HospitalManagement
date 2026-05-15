const Appointment = require('../model/appointmentModel');
const Doctor = require('../model/doctorModel');

exports.addAppointment = async (req, res) => {
    try {
        const { date, time, doctorId, hospitalId } = req.body;

        if (!date || !time || !doctorId || !hospitalId) {
            return res.status(400).json({ message: 'Date, time, doctor and hospital are required' });
        }

        const doctor = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found in this hospital' });
        }

        const appointment = await Appointment.create({
            date,
            time,
            doctorId,
            hospitalId
        });

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
