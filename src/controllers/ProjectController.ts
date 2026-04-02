import { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {
    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        // Asigna un manager
        project.manager = req.user._id

        try {
            await project.save()
            res.send('Proyecto Creado Correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                // Lógica para que se muestren los proyectos del usuario autenticado
                $or: [
                    { manager: req.user._id },   // Si es manager
                    { team: req.user._id }     // Si es team
                ]
            })  // Devuelve el manager como STRING (el ID)
            res.json(projects)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id).populate('tasks')

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if(project.manager.toString() !== req.user._id.toString() && !project.team.includes(req.user._id)) {
                const error = new Error('No tienes permiso para ver este proyecto')
                return res.status(404).json({ error: error.message })
            }
            res.json(project)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
    static updateProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if(project.manager.toString() !== req.user._id.toString()) {
                const error = new Error('Solo el manager puede editar el proyecto')
                return res.status(403).json({ error: error.message })
            }

            project.clientName = req.body.clientName
            project.description = req.body.description
            project.projectName = req.body.projectName
            await project.save()
            res.send('Proyecto Actualizado Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
    static deleteProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if(project.manager.toString() !== req.user._id.toString()) {
                const error = new Error('Solo el manager puede eliminar el proyecto')
                return res.status(403).json({ error: error.message })
            }

            await project.deleteOne()
            res.send('Proyecto Eliminado Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}