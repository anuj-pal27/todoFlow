const express = require('express');
const router = express.Router();
const {getActionLogs} = require('../controller/actionController');
const auth = require('../middleware/auth');

router.get('/',auth,getActionLogs);

module.exports = router;