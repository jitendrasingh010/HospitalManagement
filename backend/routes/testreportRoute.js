const express = require('express');
const router = express.Router();
const testreportController = require('../controller/testreportController');
const auth = require('../middelware/auth');

router.get('/pending', auth, testreportController.getPendingTests);
router.post('/add', auth, testreportController.addTestReport);
router.get('/get', auth, testreportController.getTestReports);
router.put('/update/:id', auth, testreportController.updateTestReport);
router.delete('/delete/:id', auth, testreportController.deleteTestReport);

module.exports = router;

