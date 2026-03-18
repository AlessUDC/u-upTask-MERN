import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { taskBelongsToProject, taskExists } from "../middleware/task";

const router = Router()

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El Nombre Del Proyecto Es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre Del Cliente Es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción Es Obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)
router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El Nombre Del Proyecto Es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre Del Cliente Es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción Es Obligatoria'),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.deleteProject
)

// ---- Routes para tareas(tareas dependen de proyectos) ----

// A todos los ednpoints con 'projectId' se le aplica la validateProjectExists
router.param('projectId', projectExists)

router.post('/:projectId/tasks',
    body('name')
        .notEmpty().withMessage('El Nombre De La Tarea Es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción Es Obligatoria'),
    projectExists,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

// ------ Middleware para validar que la tarea existe ------
router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El Nombre De La Tarea Es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción Es Obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('status')
        .notEmpty().withMessage('EL Estado es Obligatorio'),
    handleInputErrors,
    TaskController.updateTaskStatus
)

export default router