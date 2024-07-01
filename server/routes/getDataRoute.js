const express = require('express');
const router = express.Router();
const getData = require('../controllers/getData');
const getUserInfo = require('../controllers/getData');


router.post('/getDataNow', getData.getDataNow);
router.post('/getUserInfo', getUserInfo.getUserInfo);
router.post('/getAvgDataPast7Days', getData.getAvgDataPast7Days);
router.post('/getDevicesInfo', getData.getDevicesInfo);
router.post('/getAvgDateLastest1Day', getData.getAvgDateLastest1Day);
router.post('/getAutomationState', getData.getAutomationState);
router.post('/getPumpLog', getData.getPumpLog);
router.post('/getThreshold', getData.getThreshold);

module.exports = router;