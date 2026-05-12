const express = require('express');
const router = express.Router();

const districtController = require('../controller/districtController');

router.post('/adddistrict', districtController.addDistrict);
router.get('/getdistrict', districtController.getDistrict);
router.put('/updatedistrict/:id', districtController.updateDistrict);
router.delete('/deletedistrict/:id', districtController.deleteDistrict);

module.exports = router;
