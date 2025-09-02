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
    async validate(payload: JwtPayload) {
        const { name, role, userId, companyId, studentId } = payload;
        const user = await this.prisma.auth.findUnique({
          where: { name },
          include: {
            student: true,
            company: true
          }
        });
        
        if (!user) {
            throw new UnauthorizedException();
        }
        
        // Verify that the role in JWT matches the user's current role in database
        if (user.role !== role) {
            throw new UnauthorizedException('Role mismatch');
        }
        
        // Return user data with related entity IDs and additional information
        return {
            ...user,
            companyId: user.company?.id || companyId,
            studentId: user.student?.id || studentId,
            // Include email from the related entity if available
            email: user.company?.email || user.student?.email,
            userRole: user.role // Add this for clarity
        };
    }
}