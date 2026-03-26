import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'Uptask <admin@uptask.com>',
            to: user.email,
            subject: 'Uptask - Confirma tu cuenta',
            text: `UpTask - Confirma tu cuenta en Uptask`,
            html: `
                <p>Hola ${user.name}, tu cuenta ha sido creada exitosamente.</p>
                <p>Visita el siguiente enlace para confirmar tu cuenta:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">
                    Confirma tu cuenta
                </a>
                <p>Ingresa el código <b>${user.token}</b></p>
                <p>Este código expirará en 10 minutos</p>
                <p>Si no creaste esta cuenta, ignora este correo.</p>
            `
        })
        console.log('Email enviado', info.messageId)
    }
}