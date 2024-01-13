import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {userRouter } from './routes/user.routes.js'

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

// Routes import


// routes Declearetion

App.use('/api/v1/users',userRouter) //go to user router ....



export  default App