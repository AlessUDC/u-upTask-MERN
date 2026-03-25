import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { body } from "express-validator"
import { handleInputErrors } from "../middleware/validation"

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    body('email')
        .isEmail().withMessage('El email no es válido'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los passwords no coinciden')
        }
        return true
    }),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login', 
    body('email')
        .isEmail().withMessage('El email no es válido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacío'),
    handleInputErrors,
    AuthController.login
)

export default router