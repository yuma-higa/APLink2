"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const tasks_model_1 = require("./tasks.model");
const uuid_1 = require("uuid");
let TasksService = class TasksService {
    constructor() {
        this.tasks = [];
    }
    getAllTasks() {
        return this.tasks;
    }
    getFilteredDto(filterDto) {
        const { status, search } = filterDto;
        let tempArr = this.getAllTasks();
        if (status) {
            tempArr = this.tasks.filter((task) => task.status === status);
        }
        if (search) {
            tempArr = this.tasks.filter((task) => task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search));
        }
        return tempArr;
    }
    createTask(createTaskDto) {
        const { title, description } = createTaskDto;
        const tsk = {
            id: (0, uuid_1.v4)(),
            title,
            description,
            status: tasks_model_1.taskStatus.OPEN,
        };
        this.tasks.push(tsk);
        return tsk;
    }
    getTaskById(id) {
        const found = this.tasks.find((task) => task.id === id);
        if (!found) {
            throw new common_1.NotFoundException(`task with id not found:${id}`);
        }
        return found;
    }
    deleteTaskById(id) {
        const found = this.getTaskById(id);
        this.tasks = this.tasks.filter(task => task.id !== found.id);
    }
    changeTtlById(id, title, description) {
        const tskForTtldes = this.getTaskById(id);
        tskForTtldes.title = title;
        tskForTtldes.description = description;
        return tskForTtldes;
    }
    changeStsById(id, status) {
        const found = this.getTaskById(id);
        found.status = status;
        return found;
    }
    updateTaskById(id, createTaskDto) {
        const { title, description, status } = createTaskDto;
        const tsk = this.getTaskById(id);
        tsk.title = title;
        tsk.description = description;
        tsk.status = status;
        return tsk;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)()
], TasksService);
//# sourceMappingURL=tasks.service.js.map