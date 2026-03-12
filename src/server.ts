import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'

dotenv.config()

// Conectar a la base de datos
connectDB()

const app = express()

// Lectura de JSON
app.use(express.json())

// Routes
app.use('/api/projects', projectRoutes)


export default app