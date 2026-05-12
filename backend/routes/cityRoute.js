const express = require('express');
const router = express.Router();

const cityController = require('../controller/cityController');

router.post('/addcity', cityController.addCity);
router.get('/getcity', cityController.getCity);
router.put('/updatecity/:id', cityController.updateCity);
router.delete('/deletecity/:id', cityController.deleteCity);

module.exports = router;
