import { taskStatus } from "../tasks.model";

export interface filterTaskDto {
    status?: taskStatus;
    search?: string;
}