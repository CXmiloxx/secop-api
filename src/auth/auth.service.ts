import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { Response } from 'express';

type PrismaModel = keyof PrismaService;
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: createAuthDto.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createAuthDto.contrasena, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        ...createAuthDto,
        contrasena: hashedPassword,
      },
      include: { rol: true, area: true },
    });

    return {
      data: {
        ...usuario,
      },
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: loginDto.correo },
      include: {
        rol: { select: { id: true, nombre: true } },
        area: { select: { id: true, nombre: true } },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado === false) {
      throw new UnauthorizedException('El usuario esta inactivo');
    }

    const isValid = await bcrypt.compare(loginDto.contrasena, usuario.contrasena);

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(usuario.id, usuario.correo, usuario.rolId);
    const refres_token = this.generateToken(usuario.id, usuario.correo, usuario.rolId);

    // 👉 COOKIE
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      path: '/',
    });

    res.cookie('refresh_token', refres_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      path: '/',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = usuario;

    return userWithoutPassword;
  }

  async allUsers() {
    return await this.prisma.usuario.findMany({
      omit: {
        contrasena: true,
        rolId: true,
        areaId: true,
      },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async findAll(
    model: PrismaModel,
    options?: {
      where?: Record<string, any>;
      select?: Record<string, boolean>;
    },
  ) {
    return await (this.prisma[model] as any).findMany(options);

    /*  return {
      data,
    }; */
  }

  async getProfile(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        correo: true,
        nombre: true,
        apellido: true,
        tipo_documento: true,
        documento: true,
        telefono: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  private generateToken(userId: string, correo: string, rolId: number): string {
    const payload: JwtPayload = {
      sub: userId,
      correo,
      rolId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '1d',
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    await this.findOne(id);

    const data = { ...updateAuthDto };
    if (updateAuthDto.contrasena) {
      data.contrasena = await bcrypt.hash(updateAuthDto.contrasena, 10);
    }

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true },
    });
    return usuario;
  }

  async remove(id: string) {
    await this.findOne(id);
    const usuario = await this.prisma.usuario.delete({ where: { id } });
    return usuario;
  }
}
