import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import Token from "../models/Token"
import { AuthEmail } from "../emails/AuthEmail"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            // Consulta a la db si un usuario ya está registrado
            const { email, password } = req.body

            // Prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El usuario ya existe')
                return res.status(409).json({ error: error.message })
            }

            // Crear usuario
            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(password)

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user._id

            // Enviar mail
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email para confirmar')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([ user.save(), tokenExists.deleteOne() ])

            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Error al confirmar la cuenta' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            // Revisar si el usuario existe [email]
            const user = await User.findOne({ email })
            // 1. Si el usuario NO existe
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }
            // 2. Si el usuario NO está confirmado
            if(!user.confirmed){
                // Si el usuario no está confirmado, se genera un nuevo token para él
                const token = new Token()
                token.user = user._id
                token.token = generateToken()
                await token.save()
                
                // y le envíamos el token a su email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, hemos envíado un correo de confirmación')
                return res.status(401).json({ error: error.message })
            }
            
            // Revisar la contraseña [password]
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('Password incorrecto')
                return res.status(401).json({ error: error.message })
            }
            res.send('Login exitoso')
        } catch (error) {
            res.status(500).json({ error: 'Error al iniciar sesión' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            // Se le pide al usuario que ingrese su email
            const { email } = req.body

            // Usuario existe?
            const user = await User.findOne({ email })
            if(!user){
                const error = new Error('Usuario no está registrado')
                return res.status(404).json({ error: error.message })
            }
            // Usuario confirmado?
            if(user.confirmed){
                const error = new Error('El usuario ya está confirmado')
                return res.status(403).json({ error: error.message })
            }

            // Generar nuevo token
            const token = new Token()
            token.token = generateToken()
            token.user = user._id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send(`Se envió un nuevo token de confirmación a ${user.email}`)
        } catch (error) {
            res.status(500).json({ error: 'Error al restablecer la contraseña' })
        }
    }
}