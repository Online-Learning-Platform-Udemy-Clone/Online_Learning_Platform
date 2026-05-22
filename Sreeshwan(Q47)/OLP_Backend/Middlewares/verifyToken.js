import jwt from 'jsonwebtoken'
import {config} from 'dotenv';

const {verify}=jwt;

config();

export const verifyToken=(...allowedRoles)=>{
    return (req,res,next)=>{
    const token=req.cookies?.token;
    //if req from unauthorized user
    if(!token)
    {
        return res.status(401).json({message: "Please Login First"})
    }
    try
    {   
        //If token is existed
        const decodedToken=verify(token,process.env.SECRET_KEY);
        //add the decoded token to 
        console.log(decodedToken);
        //check the role is same as role in decodedToken
        if(!allowedRoles.includes(decodedToken.role)){
            return res.status(403).json({message:"You are not authorized"})
        }
        //add the decoded token
        req.user=decodedToken;
        //call next
        next();
    }
    //If Token verification failed
    catch(err)
    {
        res.status(401).json({
            message:"Session Expired. Please Relogin",
            error: err.message
        })
    }
  };
}