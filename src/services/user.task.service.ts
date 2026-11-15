import { AppError } from "../errors/AppError";
import { createTask } from "../repositories/user.task.repository";
import { Task } from "../types/task";


function validateTitle(title: unknown): string {

    if(typeof title !== 'string' || !title.trim()) {
        throw new AppError(400, "Title is required");
    };

    const trimmedTtile = title.trim()

    if(trimmedTtile.length > 100){
        throw new AppError(400, "Title should not be more than 100 char");
    };

    return trimmedTtile;
}

export async function createUserTask(
    user_id: string,
    title: unknown
): Promise<Task> {

    const validTitle = validateTitle(title);
    return createTask(user_id,validTitle);
    
};