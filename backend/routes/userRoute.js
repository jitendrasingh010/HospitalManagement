const express = require('express');
const router=express.Router();

const userController=require('../controller/userController');
const auth=require('../middelware/auth');
router.post('/signup',userController.signUp);
router.post('/login',userController.login);
router.get('/profile',auth,userController.getProfile);
router.put('/updateprofile',auth,userController.updateProfile);
router.put('/changepassword',auth,userController.changePassword);
router.post('/forgetpassword',userController.forgetPassword);
router.post("/verify-otp", userController.verifyOTP)
router.post("/resetpassword", userController.resetPassword)



module.exports=router;
