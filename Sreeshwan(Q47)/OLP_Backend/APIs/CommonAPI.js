import exp from 'express';
import {config} from 'dotenv';
import { UserModel } from '../Models/UserModel.js';
import { hash, compare } from "bcryptjs";
import { verifyToken } from "../Middlewares/verifyToken.js";
import jwt from 'jsonwebtoken';

config();

export const commonApp=exp.Router();

const {sign}=jwt;

//Route for register
commonApp.post("/register", async(req,res,next) => {
  try {
    let allowedRoles = ["STUDENT","INSTRUCTOR"];
    //get user from req
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    //check role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    //run validators manually
    if(!newUser.password || newUser.password.trim().length===0) 
    {
        return res.status(400).json({message:"Password cannot be empty or spaces only"});
    }

    //hash password and replace plain with hashed one
    newUser.password = await hash(newUser.password, 12);

    //create New user document
    const newUserDoc = new UserModel(newUser);

    //save document
    await newUserDoc.save();
    //send res
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
  }
});


// Route for Login
commonApp.post("/login",async(req,res)=>{
    //no need to check for roles accepted to login because if correct role entered then only login
    //const allowedRolesToLogin=["STUDENT","INSTRUCTOR","ADMIN"];
    //get user cred obj from req
    const {email,password}=req.body;

    //find user by email
    const user=await UserModel.findOne({email:email});

    //if user not found
    if(!user){
        return res.status(400).json({message:"Invalid Email"});
    }

    //compare password
    const isMatched=await compare(password,user.password);

    //if passwords not matched
    if(!isMatched)
    {
        return res.status(400).json({message: "Invalid Password"});
    }

    //create jwt(jsonwebtoken)
    const signedToken=sign({id:user._id,
        email:email,
        role:user.role,
        firstName:user.firstName,
        lastName:user.lastName,
        profileImageUrl:user.profileImageUrl,
        },
        process.env.SECRET_KEY,{expiresIn:"6h"});

    res.cookie("token",signedToken,{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })

    //send res to user
    const userObj=user.toObject();
    delete userObj.password;
    res.status(200).json({message:"Login Success",payload:userObj})
})

//Route for Logout
commonApp.get("/logout",(req,res)=>{
    //delete token from cookie storage
    res.clearCookie("token",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    //send res
    res.status(200).json({message:"Logout Success"});
})

//Page Refresh
commonApp.get("/check-auth",verifyToken("STUDENT","INSTRUCTOR","ADMIN"),async(req,res)=>{
    res.status(200).json({message:"authenticated",payload:req.user})
})

//Change Password
commonApp.put("/password",verifyToken("STUDENT","INSTRUCTOR","ADMIN"),async(req,res)=>{
    //get current password and new password
    const {currentPassword,newPassword}=req.body;

    //check current password and new password are same
    if(currentPassword===newPassword)
    {
        return res.status(400).json({message:"Current Password and New Password are same in your request"})
    }
    //get current password of student/instructor/admin
    const userIdOfToken=req.user?.id;
    const userDocument=await UserModel.findById(userIdOfToken)

    //check if user exists
    if(!userDocument)
    {
        return res.status(404).json({message:"User not found"})
    }

    //check the current password of req and user are not same
    const isMatched=await compare(currentPassword,userDocument.password)
    if(!isMatched)
    {
        return res.status(403).json({message:"Your password is incorrect. Please Enter Again"})
    } 
    //run validators manually
    if(!newPassword || newPassword.trim().length===0) 
    {
        return res.status(400).json({message:"Password cannot be empty or spaces only"});
    }

    //hash the new password
    const hashedPassword=await hash(newPassword,12)

    //replace it woth original password
    userDocument.password=hashedPassword;
    //save
    await userDocument.save();
    //send res
    res.status(201).json({message:"User Password is successfully changed"})
})