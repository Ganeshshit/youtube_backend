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



export  default App