import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import User, { UserType } from "../models/User"

declare global {
    namespace Express {
        interface Request {
            user?: UserType
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No autorizado')
        return res.status(401).json({ error: error.message })  
    }
    // Authorization: "Bearer <token>" ==> ["Bearer", "<token>"] ==> "<token>"
    const token = bearer.split(' ')[1]
    
    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Verificar si el usuario existe
        if(typeof decoded === 'object' && decoded.id) {
            // Lo buscamos en la BD
            const user = await User.findById(decoded.id).select('_id email name')

            // Si existe, lo adjuntamos al request para instanciarlos en otros métodos
            if(user) {
                req.user = user
                next()
            } else {
                res.status(500).json({ error: 'Token no válido' })
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'Token no válido' })
    }
}