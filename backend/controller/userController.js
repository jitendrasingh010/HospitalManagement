const User = require('../model/userModel');
const Doctor = require('../model/doctorModel');
const Lab = require('../model/labModel');
const Hospital = require('../model/hospitalModel');
const bcrypt = require('bcrypt');
const secretKey = 'secretKey@123';
const jwt = require('jsonwebtoken');
const moment = require('moment');
const transporter = require('../nodemailer/nodemailer');
const { uploadImage } = require('../cloudnary/cloudnary');
exports.signUp = async (req, res) => {
    try {
        const { name, email, password, phone, age, gender, BG , role} = req.body;
        const data = req.body;
        if (!name || !email || !password || !phone || !age || !gender || !BG) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...data, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User added successfully' });
doct    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (user.role === 'doctor') {
            const doctor = await Doctor.findById(user.doctorId);

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor profile not found' });
            }

            if (doctor.status === 'inactive') {
                return res.status(403).json({ message: 'Your doctor account is inactive' });
            }
        }

        if (user.role === 'lab') {
            const lab = await Lab.findById(user.labId);

            if (!lab) {
                return res.status(404).json({ message: 'Lab profile not found' });
            }

            if (lab.status === 'inactive') {
                return res.status(403).json({ message: 'Your lab account is inactive' });
            }
        }

        if (user.role === 'hospital') {
            const hospital = await Hospital.findById(user.hospitalId);

            if (!hospital) {
                return res.status(404).json({ message: 'Hospital profile not found' });
            }

            if (hospital.status !== 'approved') {
                return res.status(403).json({ message: 'Your hospital account is not active' });
            }
        }

        const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId,
                doctorId: user.doctorId,
                labId: user.labId
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile data', user });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, age, gender, BG, image } = req.body;

        if (!name || !email || !phone || !age || !gender || !BG) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let imageUrl = image;

        if (image) {
            imageUrl = await uploadImage(image);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone, age, gender, BG, image: imageUrl },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.changePassword = async (req, res) => {
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
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "signup first" });
    }

    const otp = generateOTP();
    const expireTime = moment().add(5, "minutes").toDate();
    user.otp = otp;
    user.otpExpire = expireTime;

    await user.save();
    console.log("user", user);
  
    await transporter.sendMail({
      from: user.email,
      to: email,
      subject: "Password reset",
      text: `Your OTP is ${otp}. it will expire in 5 minutes`
    })
    return res.status(200).json({
      message: "OTP sent to email",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().isAfter(user.otpExpire)) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().isAfter(user.otpExpire)) {
      user.otp = null;
      user.otpExpire = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.otp = null;
    user.otpExpire = null;

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
