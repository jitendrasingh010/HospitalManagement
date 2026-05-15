const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');

router.post('/addappointment', appointmentController.addAppointment);

module.exports = router;
