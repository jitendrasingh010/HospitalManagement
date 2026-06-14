const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user: process.env.EMAIL_USER || "jitendrasingh63793@gmail.com",
        pass: process.env.EMAIL_PASS || "kgni txfg wvpp hszy"
    }
})
module.exports=transporter;
