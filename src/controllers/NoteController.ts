import { Request, Response } from "express";
import Note, { NoteType } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (req: Request<{}, {}, NoteType>, res: Response) => {
        const { content } = req.body

        const note = new Note()
        note.content = content
        note.createdBy = req.user._id
        note.task = req.task._id

        req.task.notes.push(note._id)

        try {
            await Promise.allSettled([note.save(), req.task.save()])
            res.send('Nota Creada Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la nota' })
        }
    }
    
    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task._id }).populate('createdBy', 'id name email')
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las notas' })
        }
    }
    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params
        const note = await Note.findById(noteId)
        if(!note) {
            return res.status(404).json({ error: 'Nota no encontrada' })
        }
        // Si el usuario que creó la nota no es el usuario autenticado
        if(note.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'No tienes permiso para eliminar esta nota' })
        }

        // Traemos todas las notas de la tarea y filtramos 
        req.task.notes = req.task.notes.filter( note => note.toString() !== noteId.toString() )
        
        try {
            await Promise.allSettled([note.deleteOne(), req.task.save()])
            res.send('Nota Eliminada Correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la nota' })
        }
    }
}