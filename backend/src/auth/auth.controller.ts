import { Controller,Body,Post, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService){}

@Post('/signUp')
signUp(@Body(ValidationPipe) createUserDto:CreateUserDto):Promise<void>{
    return this.auth.signUp(createUserDto);
}

@Post('signIn')
signIn(@Body(ValidationPipe) createUserDto:CreateUserDto):Promise<{accessToken:string}>{
    return this.auth.signIn(createUserDto);
}

@Post('/test')
@UseGuards(AuthGuard())
test(@Req() req ){
    console.log(req);
}
}
