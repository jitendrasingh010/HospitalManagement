const express = require('express');
const router=express.Router();

const labController=require('../controller/labController');
const auth=require('../middelware/auth');

router.post('/addlab',auth,labController.addLab);
router.get('/getlab',auth,labController.getLab);
router.put('/updatelab/:id',auth,labController.updateLab);
router.put('/updatemyprofile',auth,labController.updateMyLabProfile);
router.put('/changepassword',auth,labController.changeLabPassword);
router.put('/softdelete/:id',auth,labController.softDeleteLab);
router.put('/restore/:id',auth,labController.restoreLab);
router.delete('/deletelab/:id',auth,labController.deleteLab);

module.exports=router;
