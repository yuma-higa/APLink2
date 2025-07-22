import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Define the Auth type based on your Prisma model
interface AuthUser {
    id: string;
    name: string;
    password: string;
    role: string;
}

export const getUser = createParamDecorator((data, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});