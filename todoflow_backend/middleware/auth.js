const jwt = require('jsonwebtoken');
const User = require('../model/user');

const authMiddleware = async(req,res,next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({message:"Unauthorized"});
    }
}

module.exports = authMiddleware;