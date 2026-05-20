const Appointment = require('../model/appointmentModel');
const Doctor = require('../model/doctorModel');
const Hospital = require('../model/hospitalModel');
const User = require('../model/userModel');
const Medicine = require('../model/medicineModel');
const transporter = require('../nodemailer/nodemailer');

const formatAppointmentDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

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

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const appointment = await Appointment.create({
            date,
            time,
            doctorId,
            hospitalId,
            userId: req.user?._id
        });

        const appointmentDate = formatAppointmentDate(date);
        const patientMail = {
            from: "jitendrasingh63793@gmail.com",
            to: user.email,
            subject: 'Appointment booked successfully',
            text: `Hello ${user.name}, your appointment has been booked successfully.\n\nHospital: ${hospital.name}\nDoctor: Dr. ${doctor.name}\nSpecialization: ${doctor.specialization}\nDate: ${appointmentDate}\nTime: ${time}\n\nPlease reach the hospital on time.`
        };

        const doctorMail = {
            from: "jitendrasingh63793@gmail.com",
            to: doctor.email,
            subject: 'New appointment booked',
            text: `Hello Dr. ${doctor.name}, a new appointment has been booked.\n\nPatient: ${user.name}\nPatient Email: ${user.email}\nPatient Phone: ${user.phone}\nHospital: ${hospital.name}\nDate: ${appointmentDate}\nTime: ${time}`
        };

        await transporter.sendMail(patientMail);
        if (doctor.email) {
            await transporter.sendMail(doctorMail);
        }

        res.status(201).json({ message: 'Appointment booked successfully and mail sent', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id })
            .populate('hospitalId', 'name contact address')
            .populate('doctorId', 'name specialization fees')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'My appointments',
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        if (!req.user.doctorId) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const appointmentsData = await Appointment.find({ doctorId: req.user.doctorId })
            .populate('hospitalId', 'name contact address')
            .populate('doctorId', 'name specialization fees')
            .populate('userId', 'name email phone age gender')
            .sort({ date: -1, createdAt: -1 });

        const appointments = await Promise.all(appointmentsData.map(async (item) => {
            const appointment = item.toObject();
            const medicine = await Medicine.findOne({ appointmentId: item._id }).select('_id');
            appointment.isReached = Boolean(item.isReached || medicine);
            return appointment;
        }));

        res.status(200).json({
            message: 'Doctor appointments',
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
