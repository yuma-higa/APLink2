import { Model } from 'mongoose';
import { AuthDocument } from './auth.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private authModel;
    private jwtService;
    constructor(authModel: Model<AuthDocument>, jwtService: JwtService);
    signUp(createUserDto: CreateUserDto): Promise<void>;
    signIn(createUserDto: CreateUserDto): Promise<{
        accessToken: string;
    }>;
}
