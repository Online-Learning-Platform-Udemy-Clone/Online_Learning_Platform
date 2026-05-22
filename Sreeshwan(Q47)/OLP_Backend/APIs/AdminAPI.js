import exp from 'express';
import { verifyToken } from '../Middlewares/verifyToken.js';
import { UserModel } from '../Models/UserModel.js';

export const adminApp=exp.Router();

//Protected Admin Route to get All Users
adminApp.get("/users",verifyToken("ADMIN"),async(req,res)=>{
    //read all users
    const userList=await UserModel.find({isUserActive: true});
    //send res
    res.status(200).json({message: "All Users",payload: userList})
})

adminApp.patch("/users/deactivate",verifyToken("ADMIN"),async(req,res)=>{
    //get user id from the body
    const {userId,isUserActive}=req.body;

    //get user by id
    const userOfDb=await UserModel.findOne({_id: userId});

    //check if user found
    if(!userOfDb)
    {
        //Return user not found
        return res.status(403).json({message:"User not Found"})
    }

    //check status
    if(isUserActive===userOfDb.isUserActive){
        return res.status(200).json({message:"User already in the same state"})
    }
    //Update isUserActive property to false
    userOfDb.isUserActive=isUserActive;
    await userOfDb.save();

    //send res
    res.status(200).json({message:"User is Deactivated",payload:userOfDb})
})


adminApp.patch("/users/activate",verifyToken("ADMIN"),async(req,res)=>{
    //get user id from the body
    const {userId,isUserActive}=req.body;

    //get user by id
    const userOfDb=await UserModel.findOne({_id: userId});

    //check if user found
    if(!userOfDb)
    {
        //Return user not found
        return res.status(403).json({message:"User not Found"})
    }

    //check status
    if(isUserActive===userOfDb.isUserActive){
        return res.status(200).json({message:"User already in the same state"})
    }

    //Update isUserActive property to true
    userOfDb.isUserActive=isUserActive;
    await userOfDb.save();

    //send res
    res.status(200).json({message:"User is Activated",payload:userOfDb})
})


//Protected Admin Route to get All Courses
adminApp.get("/courses",verifyToken("ADMIN"),async(req,res)=>{
    //read all courses
    const courseList=await CourseModel.find({isCourseActive: true});
    //send res
    res.status(200).json({message: "All Courses",payload: courseList})
})

adminApp.patch("/courses/deactivate",verifyToken("ADMIN"),async(req,res)=>{
    //get course id from the body
    const {courseId,isCourseActive}=req.body;

    //get course by id
    const courseOfDb=await CourseModel.findOne({_id: courseId});

    //check if course found
    if(!courseOfDb)
    {
        //Return course not found
        return res.status(403).json({message:"Course not Found"})
    }

    //check status
    if(isCourseActive===courseOfDb.isCourseActive){
        return res.status(200).json({message:"Course already in the same state"})
    }
    //Update isCourseActive property to true
    courseOfDb.isCourseActive=isCourseActive;

    //Save the changes to DB
    await courseOfDb.save();

    //send res
    res.status(200).json({message:"Course is Deactivated",payload:courseOfDb})
})


adminApp.patch("/courses/activate",verifyToken("ADMIN"),async(req,res)=>{
    //get course id from the body
    const {courseId,isCourseActive}=req.body;

    //get course by id
    const courseOfDb=await CourseModel.findOne({_id: courseId});

    //check if course found
    if(!courseOfDb)
    {
        //Return course not found
        return res.status(403).json({message:"Course not Found"})
    }

    //check status
    if(isCourseActive===courseOfDb.isCourseActive){
        return res.status(200).json({message:"Course already in the same state"})
    }
    //Update isCourseActive property to true
    courseOfDb.isCourseActive=isCourseActive;

    //Save the changes to DB
    await courseOfDb.save();

    //send res
    res.status(200).json({message:"Course is Deactivated",payload:courseOfDb})
})


export default adminApp;