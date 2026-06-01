const express = require('express');
const router = express.Router();
const doctorController = require('../controller/doctorController');
const auth = require('../middelware/auth');

router.post('/add', auth, doctorController.addDoctor);
router.get('/get', auth, doctorController.getDoctors);
router.get('/myprofile', auth, doctorController.getMyDoctorProfile);
router.put('/update/:id', auth, doctorController.updateDoctor);
router.put('/changepassword', auth, doctorController.changeDoctorPassword);
router.delete('/delete/:id', auth, doctorController.deleteDoctor);
router.put('/softdelete/:id', auth, doctorController.softDeleteDoctor);
router.put('/restore/:id', auth, doctorController.restoreDoctor);

module.exports = router;
