const express = require('express');
const router = express.Router();
const updateData = require('../controllers/updateData');

router.post('/updateUserInfo', updateData.updateUserInfo);
router.post('/changeIOkey', updateData.changeIOkey);
router.post('/controlDevice', updateData.controlDevice);
router.post('/changeAutomationState', updateData.changeAutomationState);
router.post('/deletePumpLog', updateData.deletePumpLog);
router.post('/updateThreshold', updateData.updateThreshold);

module.exports = router;