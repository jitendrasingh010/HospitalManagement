const express = require('express');
const router = express.Router();
const doctorController = require('../controller/doctorController');
const auth = require('../middelware/auth');
router.post('/add',auth,doctorController.addDoctor);

module.exports = router;
