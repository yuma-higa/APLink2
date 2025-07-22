import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt,Strategy} from 'passport-jwt';
import {JwtPayload} from './jwt-payload.interface';
import {PrismaService} from '../prisma/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
      private prisma: PrismaService
    ){
      super({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      })
    }
    async validate(payload:JwtPayload){
        const {name, role} = payload;  // Extract both name and role from JWT
        const user = await this.prisma.auth.findUnique({
          where: {name},
        });
        if(!user){
            throw new UnauthorizedException();
        }
        // Verify that the role in JWT matches the user's current role in database
        if(user.role !== role){
            throw new UnauthorizedException('Role mismatch');
        }
        return user;
    }
}