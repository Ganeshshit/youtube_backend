import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandeler.js"
import jwt from "jsonwebtoken"





export const veifyJWT =asyncHandler(async(req,res,next)=>{

   try {
     const token=req.cookies?.accessToken||req.header("Authorization")?.repale("Bearer ","")
     console.log(token)

     if (!token) {
         throw new ApiError(401,"UnAuthorized requiest")
     }
    const decodedToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    console.log(decodedToken)
 
    const user  =User.findById(decodedToken?._id).select("-password -refreshToken")
    console.log(user)
    if(!user)
    {
     throw new ApiError(401,"Invalide Access Token")
 
    }
    req.User=user;
    next()
    
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalide")
   }

    
})