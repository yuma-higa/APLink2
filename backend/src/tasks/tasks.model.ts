export interface Task {
    id: string;
    title: string;
    description: string;
    status: taskStatus;
}

export enum taskStatus{
    OPEN = "OPEN",
    IN_PEOGRESS = "IN_PEOGRESS",
    DONE = "DONE"
}