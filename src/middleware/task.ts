import { Request, Response, NextFunction } from "express"
import Task, { TaskType } from "../models/Task"

declare global {
    namespace Express {
        interface Request {
            task: TaskType
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if (!task) {
            return res.status(404).json({ error: 'Tarea No Encontrada' })
        }
        req.task = task
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al validar el proyecto' })
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.task.project.toString() !== req.project._id.toString()) {
            const error = new Error('Acción No Válida')
            return res.status(400).json({ error: error.message })
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al validar el proyecto' })
    }
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user._id.toString() !== req.project.manager.toString()) {
            const error = new Error('Acción No Válida')
            return res.status(400).json({ error: error.message })
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al validar el proyecto' })
    }
}