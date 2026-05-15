const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const Doctor = require('../model/doctorModel');
const User = require('../model/userModel');
const Department = require('../model/departmentModel');
const SubDepartment = require('../model/subdepartmentModel');
const { uploadImage } = require('../cloudnary/cloudnary');
const transporter = require('../nodemailer/nodemailer');

exports.addDoctor = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            name,
            email,
            phone,
            gender,
            age,
            BG,
            specialization,
            experience,
            qualification,
            fees,
            availableDays,
            startTime,
            endTime,
            departmentId,
            subDepartmentId,
            about
        } = req.body;

        if (!name || !email || !phone || !specialization || !departmentId || !subDepartmentId) {
            return res.status(400).json({ message: 'Name, email, phone, specialization, department and sub department are required' });
        }

        session.startTransaction();

        const department = await Department.findOne({ _id: departmentId, hospital: req.user.hospitalId }).session(session);
        if (!department) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Department not found' });
        }

        const subDepartment = await SubDepartment.findOne({ _id: subDepartmentId, departmentId }).session(session);
        if (!subDepartment) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Sub department not found' });
        }

        const existingDoctor = await Doctor.findOne({ email }).session(session);
        if (existingDoctor) {
            await session.abortTransaction();
            return res.status(409).json({ message: 'Doctor already exists with this email' });
        }

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const doctor = new Doctor({
            name,
            email,
            phone,
            gender,
            age,
            specialization,
            experience,
            qualification,
            fees,
            availableDays,
            availableTime: {
                start: startTime,
                end: endTime
            },
            departmentId,
            subDepartmentId,
            hospital: req.user.hospitalId,
            about
        });

        await doctor.save({ session });

        const uuidPassword = randomUUID().slice(0, 8);
        const hashedPassword = await bcrypt.hash(uuidPassword, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone: Number(phone),
            age: age || 18,
            gender: gender || 'Other',
            BG: BG || 'O+',
            role: 'doctor',
            hospitalId: req.user.hospitalId,
            doctorId: doctor._id
        });

        await user.save({ session });

        await transporter.sendMail({
            from: "jitendrasingh63793@gmail.com",
            to: email,
            subject: "Doctor account created",
            text: `Hello Dr. ${name}, your doctor account is created.\n\nEmail: ${email}\nPassword: ${uuidPassword}\n\nYou can login with this email and password.`
        });

        await session.commitTransaction();

        res.status(201).json({ message: 'Doctor added successfully', doctor });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ hospital: req.user.hospitalId })
            .populate({
                path: 'subDepartmentId',
                populate: { path: 'departmentId' }
            })
            .sort({ _id: -1 });

        res.status(200).json({ message: 'Doctors retrieved successfully', doctors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            phone,
            gender,
            age,
            specialization,
            experience,
            qualification,
            fees,
            availableDays,
            startTime,
            endTime,
            departmentId,
            subDepartmentId,
            image,
            about
        } = req.body;

        if (!name || !email || !phone || !specialization || !departmentId || !subDepartmentId) {
            return res.status(400).json({ message: 'Name, email, phone, specialization, department and sub department are required' });
        }

        const department = await Department.findOne({ _id: departmentId, hospital: req.user.hospitalId });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const subDepartment = await SubDepartment.findOne({ _id: subDepartmentId, departmentId });
        if (!subDepartment) {
            return res.status(404).json({ message: 'Sub department not found' });
        }

        const updateData = {
            name,
            email,
            phone,
            gender,
            age,
            specialization,
            experience,
            qualification,
            fees,
            availableDays,
            availableTime: {
                start: startTime,
                end: endTime
            },
            departmentId,
            subDepartmentId,
            about
        };

        if (image) {
            updateData.image = await uploadImage(image);
        }

        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, hospital: req.user.hospitalId },
            updateData,
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor updated successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOneAndDelete({ _id: id, hospital: req.user.hospitalId });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.softDeleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, hospital: req.user.hospitalId },
            { status: 'inactive' },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor inactive successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.restoreDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOneAndUpdate(
            { _id: id, hospital: req.user.hospitalId },
            { status: 'active' },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor active successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
