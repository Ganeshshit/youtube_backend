import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const App =express()

App.use(cors({
    origin:'http://localhost:3000/',
    credentials:true
}))
App.use(express.json({limit:"10kb"}))
//! Encode Url

App.use(express.urlencoded({extended:true,limit:"10kb",}))

App.use(express.static("public"))

App.use(cookieParser())
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import tweetRoute from './routes/tweet.routes.js'
// Routes import


// routes Declearetion

App.use('/api/v1/users',userRouter) //go to user router ....

App.use('/api/v1/videos',videoRouter)

App.use('/api/v1/blog',tweetRoute)


export  default App