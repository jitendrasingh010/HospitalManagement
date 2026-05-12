const express=require('express');
const router=express.Router();

const stateController=require('../controller/stateController');
router.post('/addstate',stateController.addState);
router.get('/getstate',stateController.getState);
router.put('/updatestate/:id',stateController.updateState);
router.delete('/deletestate/:id',stateController.deleteState);
module.exports=router;