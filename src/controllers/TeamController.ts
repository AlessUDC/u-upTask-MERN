import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        // Find user
        const user = await User.findOne({ email }).select('_id name email')
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project._id).populate({
            path: 'team',
            select: '_id name email'
        })
        
        res.json(project.team)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body
        const project = req.project

        // Busca el usuario
        const user = await User.findById(id).select('_id')
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        // Comprueba si el usuario ya es miembro del proyecto
        if (project.team.some(team => team.toString() === user._id.toString())) {
            const error = new Error('El usuario ya es miembro del proyecto')
            return res.status(409).json({ error: error.message })
        }

        // Añade el usuario al proyecto
        project.team.push(user._id)
        await project.save()

        res.send('Usuario agregado correctamente')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params
        const project = req.project

        // Comprueba si el usuario NO es miembro del proyecto
        if (!project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no es miembro del proyecto')
            return res.status(409).json({ error: error.message })
        }

        project.team = project.team.filter( teamMember => teamMember.toString() !== userId )

        await project.save()

        res.send('Usuario eliminado correctamente')
    }
}