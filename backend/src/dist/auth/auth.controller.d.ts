import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    signUp(createUserDto: CreateUserDto): Promise<void>;
    signIn(createUserDto: CreateUserDto): Promise<{
        accessToken: string;
    }>;
    test(req: any): void;
}
