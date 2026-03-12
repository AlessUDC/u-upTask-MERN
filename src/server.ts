import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'

dotenv.config()

// Conectar a la base de datos
connectDB()

const app = express()

export default app