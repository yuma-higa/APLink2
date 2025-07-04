import {MinLength,MaxLength,Matches,IsString} from 'class-validator'

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
}