const Task = require('../model/task');
const User = require('../model/user');
const ActionLog = require('../model/actionLog');


const createTask = async (req,res) =>{
    try{
        const {title,description,assignee,status,priority} = req.body;
        if(!title || !description  || !status || !priority){
            return res.status(400).json({message:"All fields are required"});
        }
        const task = await Task.create({
            title,
            description,
            assignee,
            status,
            priority,
        });
        await ActionLog.create({
            actionType:'CREATE',
            taskId:task._id,
            performedBy:req.user.id,
            details:{
                title:task.title,
            }
        })
        res.status(201).json({message:"Task created successfully",task});
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const getTasks = async (req,res) =>{
    try{
        const tasks = await Task.find().populate('assignee','username');
        res.status(200).json(tasks);
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const getTaskById = async (req,res) =>{
    try{
        const task = await Task.findById(req.params.id).populate('assignee','username');
        if(!task){
            return res.status(404).json({message:"Task not found"});
        }
        res.status(200).json(task);
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const updateTask = async(req,res) =>{
    try{
        const id = req.params.id;
        const {version,title,description,assignee,status,priority} = req.body;
        const task = await Task.findById(id);
        if (task.version !== version) {
            return res.status(409).json({ message: 'Conflict detected', currentTask: task });
          }
        
        if(!task){
            return res.status(404).json({message:"Task not found"});
        }
        Object.assign(task, {title,description,assignee,status,priority}, {
            version: task.version + 1,
            updatedAt: new Date()
          });
        await task.save();
        await ActionLog.create({
            actionType:'UPDATE',
            taskId:task._id,
            performedBy:req.user.id,
            details:{
                title:task.title,
                description:task.description,
                assignee:task.assignee,
                status:task.status,
                priority:task.priority,
            }
        })
        res.status(200).json({message:"Task updated successfully",task});
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const deleteTask = async(req,res) =>{
    try{
        const id = req.params.id;
        const task = await Task.findById(id);
        if(!task){
            return res.status(404).json({message:"Task not found"});
        }
        await Task.findByIdAndDelete(id);
        await ActionLog.create({
            actionType:'DELETE',
            taskId:task._id,
            performedBy:req.user.id,
            details:{
                title:task.title,
                description:task.description,
                assignee:task.assignee,
                status:task.status,
                priority:task.priority,
            }
        })
        res.status(200).json({message:"Task deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const smartAssign = async(req,res) =>{
    try{
        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        
        if(!task){
            return res.status(404).json({message:"Task not found"});
        }

        // Check if task already has an assignee
        if(task.assignee){
            return res.status(400).json({message:"Task is already assigned to a user"});
        }

        // Get all users
        const users = await User.find({});
        
        if(users.length === 0){
            return res.status(404).json({message:"No users found in the system"});
        }
        
        // Count active tasks for each user
        const userTaskCounts = [];
        
        for(const user of users){
            const activeTasks = await Task.countDocuments({
                assignee: user._id,
                status: { $ne: 'Done' }
            });
            
            userTaskCounts.push({
                userId: user._id,
                username: user.username,
                taskCount: activeTasks
            });
        }
        
        // Sort by task count (ascending) to find user with least tasks
        userTaskCounts.sort((a, b) => a.taskCount - b.taskCount);
        
        const bestUser = userTaskCounts[0];
        
        // Update the task with the new assignee
        task.assignee = bestUser.userId;
        task.version = task.version + 1;
        task.updatedAt = new Date();
        await task.save();
        
        // Log the action
        await ActionLog.create({
            actionType: 'SMART_ASSIGN',
            taskId: task._id,
            performedBy: req.user.id,
            details: {
                title: task.title,
                previousAssignee: null,
                newAssignee: bestUser.username,
                reason: `Auto-assigned to ${bestUser.username} (${bestUser.taskCount} active tasks)`
            }
        });
        
        res.status(200).json({
            message: "Task smart assigned successfully",
            task: await Task.findById(taskId).populate('assignee', 'username'),
            assignmentDetails: {
                assignedTo: bestUser.username,
                activeTaskCount: bestUser.taskCount,
                allUserCounts: userTaskCounts
            }
        });
        
    }catch(error){
        console.error('Smart Assign Error:', error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    smartAssign,
}