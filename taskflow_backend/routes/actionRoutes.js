const express = require('express');
const router = express.Router();
const {getActionLogs,deleteActionLog} = require('../controller/actionController');
const auth = require('../middleware/auth');

router.get('/',auth,getActionLogs);
router.delete('/',auth,deleteActionLog);
module.exports = router;