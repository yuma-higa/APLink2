import { Controller, Get,Post,Body, Param,Delete, Put, Patch, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import {Task, taskStatus} from './tasks.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { filterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';


@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}  
@Get()
getAllTask(@Query() filterDto:filterTaskDto):Task[]{
    if(Object.keys(filterDto).length){
        return this.tasksService.getFilteredDto(filterDto);
    }else{
    return this.tasksService.getAllTasks();
    }
}
@Get('/:id')
getTaskById(@Param('id') id:string):Task{
    return this.tasksService.getTaskById(id);
}

@Post()
createTask(@Body() createTaskDto:CreateTaskDto):Task{
   return this.tasksService.createTask(createTaskDto);
}
@Delete('/:id')
deleteTskById(@Param('id') id:string):void{
    this.tasksService.deleteTaskById(id);
}
@Patch('/:id')
changeTitleById(@Param('id') id:string,@Body() createTaskDto:CreateTaskDto):Task{
    return this.tasksService.changeTtlById(id,createTaskDto.title,createTaskDto.description);
}
@Patch('/:id/status')
UpdateStatus(@Param("id") id:string,@Body() updateTaskStatusDto:UpdateTaskStatusDto):Task{
    const {status} = updateTaskStatusDto;
    return this.tasksService.changeStsById(id,status);
}
@Patch('/:id')
updateTask(@Param('id') id:string, @Body() createTask:CreateTaskDto):Task{
    return this.tasksService.updateTaskById(id,createTask);
}
}

