import { TasksService } from './tasks.service';
import { Task } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { filterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    getAllTask(filterDto: filterTaskDto): Task[];
    getTaskById(id: string): Task;
    createTask(createTaskDto: CreateTaskDto): Task;
    deleteTskById(id: string): void;
    changeTitleById(id: string, createTaskDto: CreateTaskDto): Task;
    UpdateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Task;
    updateTask(id: string, createTask: CreateTaskDto): Task;
}
