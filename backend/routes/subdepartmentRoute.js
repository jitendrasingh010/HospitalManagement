const express= require('express');
const router= express.Router();
const subDepartmentController= require('../controller/subdepartmentController');
const auth = require('../middelware/auth');

router.post('/add',auth,subDepartmentController.addSubDepartment);
router.get('/get',auth,subDepartmentController.getSubDepartment);
router.put('/update/:id',auth,subDepartmentController.updateSubDepartment);
router.delete('/delete/:id',auth,subDepartmentController.deleteSubDepartment);
router.put('/softdelete/:id',auth,subDepartmentController.softDeleteSubDepartment);
router.put('/restore/:id',auth,subDepartmentController.restoreSubDepartment);
module.exports= router;
