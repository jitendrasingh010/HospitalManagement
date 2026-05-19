const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const Lab = require('../model/labModel');
const User = require('../model/userModel');
const transporter = require('../nodemailer/nodemailer');
const { uploadImage } = require('../cloudnary/cloudnary');

exports.addLab = async (req, res) => {
    try {
        const { name, email, location, contactNumber } = req.body;

        if (!name || !email || !location || !contactNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!req.user.hospitalId) {
            return res.status(403).json({ message: 'Only hospital can add lab' });
        }

        const oldLab = await Lab.findOne({ email });
        if (oldLab) {
            return res.status(409).json({ message: 'Lab already exists with this email' });
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const lab = new Lab({
            name,
            email,
            location,
            contactNumber,
            hospitalID: req.user.hospitalId
        });

        await lab.save();

        const uuidPassword = randomUUID().slice(0, 8);
        const hashedPassword = await bcrypt.hash(uuidPassword, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone: Number(contactNumber),
            age: 18,
            gender: 'Other',
            BG: 'O+',
            role: 'lab',
            hospitalId: req.user.hospitalId,
            labId: lab._id
        });

        await user.save();

        await transporter.sendMail({
            from: "jitendrasingh63793@gmail.com",
            to: email,
            subject: "Lab account created",
            text: `Hello ${name}, your lab account is created.\n\nEmail: ${email}\nPassword: ${uuidPassword}\n\nYou can login with this email and password.`
        });

        res.status(201).json({ message: 'Lab added successfully', lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLab = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'hospital') {
            filter.hospitalID = req.user.hospitalId;
        }

        if (req.user.role === 'lab') {
            filter._id = req.user.labId;
        }

        const labs = await Lab.find(filter).sort({ _id: -1 });

        res.status(200).json({ message: 'Labs loaded successfully', labs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLab = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, location, contactNumber, status } = req.body;

        if (!name || !email || !location || !contactNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const lab = await Lab.findOneAndUpdate(
            { _id: id, hospitalID: req.user.hospitalId },
            { name, email, location, contactNumber, status },
            { new: true }
        );

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        await User.findOneAndUpdate(
            { labId: id },
            { name, email, phone: Number(contactNumber) }
        );

        res.status(200).json({ message: 'Lab updated successfully', lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMyLabProfile = async (req, res) => {
    try {
        const { name, email, location, contactNumber, image } = req.body;

        if (!name || !email || !location || !contactNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!req.user.labId) {
            return res.status(404).json({ message: 'Lab profile not found' });
        }

        let imageUrl = image || '';

        if (image) {
            imageUrl = await uploadImage(image);
        }

        const lab = await Lab.findByIdAndUpdate(
            req.user.labId,
            { name, email, location, contactNumber, image: imageUrl },
            { new: true }
        );

        if (!lab) {
            return res.status(404).json({ message: 'Lab profile not found' });
        }

        await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone: Number(contactNumber), image: imageUrl }
        );

        res.status(200).json({ message: 'Lab profile updated successfully', lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changeLabPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is wrong' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteLab = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findOneAndDelete({ _id: id, hospitalID: req.user.hospitalId });

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        await User.findOneAndDelete({ labId: id });

        res.status(200).json({ message: 'Lab deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.softDeleteLab = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findOneAndUpdate(
            { _id: id, hospitalID: req.user.hospitalId },
            { status: 'inactive' },
            { new: true }
        );

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        res.status(200).json({ message: 'Lab inactive successfully', lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.restoreLab = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findOneAndUpdate(
            { _id: id, hospitalID: req.user.hospitalId },
            { status: 'active' },
            { new: true }
        );

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        res.status(200).json({ message: 'Lab active successfully', lab });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
