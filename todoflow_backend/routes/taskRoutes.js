const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {createTask,getTasks,getTaskById,updateTask,deleteTask,smartAssign} = require('../controller/taskController');

router.get('/',auth,getTasks);
router.post('/',auth,createTask);
router.get('/:id',auth,getTaskById);
router.get('/:id/smart-assign',auth,smartAssign);
router.put('/:id',auth,updateTask);
router.delete('/:id',auth,deleteTask);

module.exports = router;