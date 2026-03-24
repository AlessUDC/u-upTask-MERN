import mongoose , { Schema, Document } from "mongoose"

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema : Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        // Trim elimina los espacios en blanco excedentes
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User', userSchema)

export default User