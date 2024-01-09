import dotenv from 'dotenv'
import connectDB from "./src/db/index.js";
import  App  from './src/app.js';


dotenv.config({path:'./env'})



connectDB()
.then(()=>{
    App.on("error",(error)=>{
        console.log("error",error)
        throw error
    })
    App.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port ${process.env.PORT||8000}`)
    })
})
.catch((err)=>{
    console.log("Mongo db Connection Failed"+err)
})

