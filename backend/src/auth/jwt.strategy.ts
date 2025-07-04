import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt,Strategy} from 'passport-jwt';
import {JwtPayload} from './jwt-payload.interface';
import {PrismaService} from '../prisma/prisma.service';
import { InjectModel } from '@nestjs/mongoose';



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
        const {name} =payload;
        const user = await this.prisma.auth.findUnique({
          where: {name},
        });
        if(!user){
            throw new UnauthorizedException();
        }
        return user;
    }
}