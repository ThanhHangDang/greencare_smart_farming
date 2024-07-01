const express = require('express');
const router = express.Router();
const adafruitInteract = require('../controllers/adafruitInteract');

router.post('/getImage', adafruitInteract.getImage);

module.exports = router;