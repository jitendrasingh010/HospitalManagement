const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');
const auth = require('../middelware/auth');

router.post('/addappointment', auth, appointmentController.addAppointment);
router.get('/myappointments', auth, appointmentController.getMyAppointments);
router.get('/doctorappointments', auth, appointmentController.getDoctorAppointments);
router.get('/hospitalappointments', auth, appointmentController.getHospitalAppointments);

module.exports = router;
