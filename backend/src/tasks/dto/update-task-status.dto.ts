import { IsEnum } from "class-validator";
import { taskStatus } from "../tasks.model";


export class UpdateTaskStatusDto  {
    @IsEnum(taskStatus)
    status:taskStatus;
}