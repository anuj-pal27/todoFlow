const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async(req,res)=>{
    const {username,email,password} = req.body;
    if(!username || !email || !password){
        res.status(400).json({message:"All fields are required"});
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({username,email,password:hashedPassword});
    await newUser.save();       

    res.status(201).json({message:"User created successfully",user:newUser});
}

const login = async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({message:"Invalid credentials"});
    }
    const isPasswordCorrect = await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect){
        return res.status(401).json({message:"Invalid credentials"});
    }
    const payload= {
        id:user._id,
        username:user.username,
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1h"});
    res.cookie('token',token,{httpOnly:true,secure:true,maxAge:3600000});
    return res.status(200).json({message:"Login successful",token});
}

const getAllUsers = async(req,res)=>{
    try{
        const users = await User.find({}, 'username email _id');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

module.exports = {signup,login,getAllUsers};