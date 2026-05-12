const jwt = require("jsonwebtoken");
const secretKey = "secretKey@123";
const User = require('../model/userModel');

module.exports = async (req, res, next) => {
    try {
        const authToken = req.headers.authorization;

        if (!authToken) {
            return res.status(401).json({ message: "Token required" });
        }

        const token = authToken.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token required" });
        }

        const verifyToken = jwt.verify(token, secretKey);
        const user = await User.findOne({ email: verifyToken.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

