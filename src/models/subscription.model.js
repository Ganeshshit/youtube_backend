import mongoose, { Schema } from "mongoose";


const subsciptionSchema =new Schema({

    subscribre:{
        type:Schema.Types.ObjectId,//One who is subscribing

        ref:"User"
    },
    chanel:{
        type:Schema.Types.ObjectId,//One to whom  subcriber is subscring

        ref:"User"
    }
},{timeseries:true})


export const Subsciption =mongoose.model("Subscription",subsciptionSchema)