const express=require('express');
const router=express.Router();
const medicineController=require('../controller/medicineController');
const auth = require('../middelware/auth');

router.post('/add', auth, medicineController.addMedicine);
router.get('/appointment/:appointmentId', auth, medicineController.getAppointmentMedicines);

module.exports = router;
