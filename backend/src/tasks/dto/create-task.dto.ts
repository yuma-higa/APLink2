import {IsNotEmpty} from "class-validator";
import { taskStatus } from "../tasks.model";

    export class CreateTaskDto {
    id:string;

    @IsNotEmpty()
    title:string;

    @IsNotEmpty()
    description: string;

    status: taskStatus;
}
