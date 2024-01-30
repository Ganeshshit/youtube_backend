import dotenv from 'dotenv'
import connectDB from "./src/db/index.js";
import  App  from './src/app.js';


dotenv.config({path:'./.env'})
const MONGO_URI=process.env.MONGO_URI


connectDB(MONGO_URI)
.then(()=>{
    App.on("error",(error)=>{
        console.log("error",error)
        throw error
    })
    App.listen(process.env.PORT,()=>{
        
        
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db Connection Failed"+err)
})

