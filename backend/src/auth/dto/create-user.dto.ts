import {MinLength,MaxLength,Matches,IsString,IsEnum,IsOptional} from 'class-validator'


export enum UserRole {
    STUDENT = "STUDENT",
    COMPANY = "COMPANY"
}
export class CreateUserDto{
    @IsString()
    @MaxLength(20,)
    @MinLength(3)
    name:string;

    @IsString()
    @MaxLength(40)
    @MinLength(8)
    @Matches(
       /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,32})/,
        {message: "your password is weak"}
    )
    password:string;

    @IsOptional()
    @IsEnum(UserRole, { 
        message: 'Role must be either STUDENT or COMPANY' 
    })
    role?: UserRole; 
}