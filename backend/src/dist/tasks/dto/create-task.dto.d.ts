import { taskStatus } from "../tasks.model";
export declare class CreateTaskDto {
    id: string;
    title: string;
    description: string;
    status: taskStatus;
}
