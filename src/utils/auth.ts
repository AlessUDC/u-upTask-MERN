import bcrypt from "bcrypt"

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const checkPassword = async (enteredPassword: string, storedHash: string) => {
    return await bcrypt.compare(enteredPassword, storedHash)
    // Devuelve true o false si la contraseña es correcta o no
}