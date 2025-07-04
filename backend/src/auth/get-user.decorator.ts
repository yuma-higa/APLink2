import { createParamDecorator,ExecutionContext } from "@nestjs/common";
import { Auth } from './auth.schema';

export const getUser = createParamDecorator((data,ctx:ExecutionContext):Auth =>{
    const req = ctx.switchToHttp().getRequest();
    return req.user
})