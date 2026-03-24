import { Request, Response } from "express";
import User from "../models/User";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const user = new User(req.body)
            await user.save()
            res.json('Cuenta creada, revisa tu email para confirmar')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' })
        }
    }
}