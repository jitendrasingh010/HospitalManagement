const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const secretKey = 'secretKey@123';
const jwt = require('jsonwebtoken');
const moment = require('moment');
const transporter = require('../nodemailer/nodemailer');
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
    } catch (error) {
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
        const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', user, token });
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
        const { name, email, phone, age, gender, BG } = req.body;

        if (!name || !email || !phone || !age || !gender || !BG) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone, age, gender, BG },
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


