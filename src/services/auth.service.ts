import { AppError } from "../errors/AppError";
import { createUser, FindUserByEmail } from "../repositories/user.repository";
import bcrypt from 'bcryptjs';

export async function registerUser(
    email: string,
    password: string
): Promise <void> {

    if (!email || !password) {
        throw new AppError(400,"Email and password are required");
    };

    if (password.length < 6) {
        throw new AppError(400,"Password must be at least 6 characters");
    };

    const normalizeEmail = email.toLowerCase().trim();

    const existingUser = await FindUserByEmail(normalizeEmail);

    if(existingUser) {
        throw new AppError(409,"Email already exists");
    };

    const passwordHash = await bcrypt.hash(password,10);

    await createUser(normalizeEmail,passwordHash);
};

