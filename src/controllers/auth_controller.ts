import  {Request,Response} from "express";
import userModel from "../models/User_model"
import bcrypt from 'bcrypt'
import jwt , {SignOptions} from 'jsonwebtoken'


const register = async (req:Request,res:Response)=>{
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password,salt)
    if(!req.body.profileImage){
        req.body.profileImage = ".../public/photos/avatar.png"
    }
    const existingUsername = await userModel.find({username:req.body.username})
    const existingEmail = await userModel.find({emial:req.body.email})
    
}