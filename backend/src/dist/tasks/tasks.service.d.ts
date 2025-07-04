import { Task, taskStatus } from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { filterTaskDto } from './dto/filter-task.dto';
export declare class TasksService {
    private tasks;
    getAllTasks(): Task[];
    getFilteredDto(filterDto: filterTaskDto): Task[];
    createTask(createTaskDto: CreateTaskDto): Task;
    getTaskById(id: string): Task;
    deleteTaskById(id: string): void;
    changeTtlById(id: string, title: string, description: string): Task;
    changeStsById(id: string, status: taskStatus): Task;
    updateTaskById(id: string, createTaskDto: CreateTaskDto): Task;
}
