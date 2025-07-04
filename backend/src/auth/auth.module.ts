import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {Auth, AuthSchema} from './auth.schema';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import *as dotenv from 'dotenv';
import { JwtStrategy } from './jwt.strategy';

dotenv.config();
@Module({ 
  imports: [
    PrismaModule,
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions:{
        expiresIn:3600
      }
    })
  ],
  providers: [AuthService,JwtStrategy],
  controllers: [AuthController],
  exports:[JwtStrategy,PassportModule]
})
export class AuthModule {}
