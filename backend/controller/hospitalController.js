const Hospital = require('../model/hospitalModel');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const transporter = require('../nodemailer/nodemailer');

exports.addHospital = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            pincode,
            speciality,
            contact,
            emergencyAvailable,
            numberOfDoctors,
            numberOfBeds,
            openingTime,
            closingTime,
            rating,
            ambulanceService,
            establishedYear,
            description,
            status
        } = req.body || {};

        if (!name || !email || !address || !pincode || !speciality || !contact) {
            return res.status(400).json({ message: "Name, email, address, pincode, speciality and contact are required" });
        }

        const hospital = await Hospital.create({
            name,
            email,
            address,
            pincode,
            speciality,
            contact,
            emergencyAvailable,
            numberOfDoctors,
            numberOfBeds,
            openingTime,
            closingTime,
            rating,
            ambulanceService,
            establishedYear,
            description,
            status
        });

        res.status(201).json({ message: "Hospital added successfully", hospital });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHospital = async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ createdAt: -1 });
        res.status(200).json({ message: "Hospital data", hospitals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveHospital = async (req, res) => {
    try {
        const id = req.params.id;

        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const uuidpassword = randomUUID().slice(0, 8);
        const hashedPassword = await bcrypt.hash(uuidpassword, 10);

        hospital.status = "approved";
        await hospital.save();

        let user = await User.findOne({ email: hospital.email });

        if (!user) {
            user = await User.create({
                name: hospital.name,
                email: hospital.email,
                password: hashedPassword,
                phone: Number(hospital.contact),
                age: 18,
                gender: "other",
                BG: "O+",
                role: "hospital",
                hospitalId: hospital._id
            });
        } else {
            user.name = hospital.name;
            user.password = hashedPassword;
            user.phone = Number(hospital.contact);
            user.role = "hospital";
            user.hospitalId = hospital._id;
            await user.save();
        }

        await transporter.sendMail({
            from: "jitendrasingh63793@gmail.com",
            to: hospital.email,
            subject: "Hospital account approved",
            text: `Hello ${hospital.name}, your hospital account is approved.\n\nEmail: ${hospital.email}\nPassword: ${uuidpassword}\n\nYou can login with this email and password.`
        });

        res.status(200).json({
            message: "Hospital approved successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectHospital = async (req, res) => {
    try {
        const id = req.params.id;

        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        hospital.status = "rejected";
        await hospital.save();

        await User.findOneAndDelete({ email: hospital.email });

        res.status(200).json({
            message: "Hospital rejected successfully",
            hospital
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json({ message: "Hospital updated successfully", hospital });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json({ message: "Hospital deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
