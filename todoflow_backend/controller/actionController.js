const ActionLog = require('../model/actionLog');

const getActionLogs = async(req,res) =>{
    try{
        const logs = await ActionLog.find().sort({timestamp:-1}).limit(20).populate('performedBy','username');
        res.status(200).json(logs);
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const deleteActionLog = async(req,res) =>{
    try{
        await ActionLog.deleteMany();
        // Broadcast a clear event
        broadcastActionLog({ type: 'CLEAR' });
        res.status(200).json({message:"Action logs deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

module.exports = {
    getActionLogs,
    deleteActionLog
}