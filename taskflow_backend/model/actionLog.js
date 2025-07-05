const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
    actionType:{
        type: String,
        enum:['CREATE','UPDATE','DELETE','ASSIGN','STATUS_CHANGE','PRIORITY_CHANGE','DRAG_DROP'],
        required:true,
    },
    taskId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    performedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    timestamp:{
        type: Date,
        default: Date.now,
    },
    details:{
        type: Object,
    }
});

module.exports = mongoose.model('ActionLog', actionLogSchema);