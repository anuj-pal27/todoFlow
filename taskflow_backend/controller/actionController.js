const ActionLog = require('../model/actionLog');

const getActionLogs = async(req,res) =>{
    try{
        const logs = await ActionLog.find().sort({timestamp:-1}).limit(20).populate('performedBy','username');
        res.status(200).json(logs);
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

module.exports = {
    getActionLogs,
}