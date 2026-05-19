const Hospital = require('../model/hospitalModel');
const HospitalImg = require('../model/hospitalimg');
const User = require('../model/userModel');
const Doctor = require('../model/doctorModel');
const Department = require('../model/departmentModel');
const SubDepartment = require('../model/subdepartmentModel');
const Lab = require('../model/labModel');
const Test = require('../model/testModel');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const { uploadImage } = require('../cloudnary/cloudnary');
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
            images,
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

        const oldUser = await User.findOne({ email });

        if (!oldUser) {
            const hashedPassword = await bcrypt.hash(contact.toString(), 10);

            await User.create({
                name,
                email,
                password: hashedPassword,
                phone: Number(contact),
                age: 18,
                gender: "other",
                BG: "O+",
                role: "hospital",
                hospitalId: hospital._id
            });
        } else {
            oldUser.name = name;
            oldUser.phone = Number(contact);
            oldUser.role = "hospital";
            oldUser.hospitalId = hospital._id;
            await oldUser.save();
        }

        if (images) {
            const imageList = Array.isArray(images) ? images : [images];
            const hospitalImages = [];

            for (const image of imageList) {
                if (image) {
                    const imageUrl = await uploadImage(image);
                    hospitalImages.push(imageUrl);
                }
            }

            if (hospitalImages.length > 0) {
                await HospitalImg.create({
                    hospital: hospital._id,
                    name: hospital.name,
                    img: hospitalImages
                });
            }
        }

        res.status(201).json({ message: "Hospital added successfully", hospital });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHospital = async (req, res) => {
    try {
        const hospitals = await Hospital.find()
            .populate({
                path: 'address',
                populate: [
                    { path: 'district' },
                    { path: 'state' }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        const hospitalData = [];

        for (const hospital of hospitals) {
            const hospitalImages = await HospitalImg.findOne({ hospital: hospital._id });
            hospitalData.push({
                ...hospital,
                images: hospitalImages ? hospitalImages.img : []
            });
        }

        res.status(200).json({ message: "Hospital data", hospitals: hospitalData });
        console.log("hospital data:", hospitalData);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ status: "approved" })
            .populate({
                path: 'address',
                populate: [
                    { path: 'district' },
                    { path: 'state' }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        const hospitalData = [];

        for (const hospital of hospitals) {
            const hospitalImages = await HospitalImg.findOne({ hospital: hospital._id });
            const departments = await Department.find({ hospital: hospital._id, status: "active" });
            const departmentIds = departments.map((department) => department._id);
            const subDepartments = await SubDepartment.find({
                departmentId: { $in: departmentIds },
                status: "active"
            }).populate('departmentId');

            hospitalData.push({
                ...hospital,
                images: hospitalImages ? hospitalImages.img : [],
                departments,
                subDepartments
            });
        }

        res.status(200).json({ message: "Approved hospitals", hospitals: hospitalData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: "active" })
            .populate('hospital')
            .populate({
                path: 'subDepartmentId',
                populate: { path: 'departmentId' }
            })
            .sort({ createdAt: -1 });

        const approvedDoctors = doctors.filter((doctor) => doctor.hospital?.status === "approved");

        res.status(200).json({ message: "Approved doctors", doctors: approvedDoctors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicHospitalDetails = async (req, res) => {
    try {
        const hospitalId = req.params.id;

        const hospital = await Hospital.findOne({ _id: hospitalId, status: "approved" })
            .populate({
                path: 'address',
                populate: [
                    { path: 'district' },
                    { path: 'state' }
                ]
            })
            .lean();

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const hospitalImages = await HospitalImg.findOne({ hospital: hospital._id });
        const departments = await Department.find({ hospital: hospitalId, status: "active" }).select('_id');
        const departmentIds = departments.map((department) => department._id);

        const subDepartments = await SubDepartment.find({
            departmentId: { $in: departmentIds },
            status: "active"
        }).populate('departmentId');

        const doctors = await Doctor.find({
            hospital: hospitalId,
            status: "active"
        }).populate({
            path: 'subDepartmentId',
            populate: { path: 'departmentId' }
        });

        const labs = await Lab.find({ hospitalID: hospitalId, status: "active" }).select('_id name');
        const tests = await Test.find({
            labId: { $in: labs.map((lab) => lab._id) },
            status: "active"
        }).populate('labId', 'name');

        res.status(200).json({
            message: "Hospital details",
            hospital: {
                ...hospital,
                images: hospitalImages ? hospitalImages.img : []
            },
            doctors,
            subDepartments,
            tests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHospitalTests = async (req, res) => {
    try {
        if (!req.user.hospitalId) {
            return res.status(403).json({ message: "Only hospital can get tests" });
        }

        const labs = await Lab.find({ hospitalID: req.user.hospitalId }).select('_id');
        let tests = [];

        for (const lab of labs) {
            const labTests = await Test.find({ labId: lab._id })
                .populate('labId', 'name email')
                .sort({ createdAt: -1 });

            tests = [...tests, ...labTests];
        }

        res.status(200).json({ message: "Hospital tests", tests });
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

        await HospitalImg.deleteMany({ hospital: req.params.id });

        res.status(200).json({ message: "Hospital deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
