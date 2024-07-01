const express = require('express');
const router = express.Router();
const authenticate = require('../controllers/authentic');

router.post('/authenticate', authenticate.authenticate);
router.post('/signup', authenticate.signup);

module.exports = router;