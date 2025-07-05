const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {createTask,getTasks,getTaskById,updateTask,deleteTask} = require('../controller/taskController');

router.get('/',auth,getTasks);
router.post('/',auth,createTask);
router.get('/:id',auth,getTaskById);
router.put('/:id',auth,updateTask);
router.delete('/:id',auth,deleteTask);

module.exports = router;