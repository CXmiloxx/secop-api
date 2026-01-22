import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { appConfig } from '@/config/app.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfig.secretJwt,
    });
  }

  async validate(payload: JwtPayload) {
    // 1️⃣ Validar tipo de token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        rol: { select: { id: true, nombre: true } },
        area: { select: { id: true, nombre: true } },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.estado === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 2️⃣ Nunca retornar contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = usuario;

    return userWithoutPassword;
  }
}
