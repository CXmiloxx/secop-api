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
    // Verificar si el rol existe
    const rol = await this.prisma.rol.findUnique({
      where: { id: createAuthDto.rolId },
    });

    if (!rol) {
      throw new NotFoundException('El rol especificado no existe');
    }

    // Verificar si el área existe
    const area = await this.prisma.area.findUnique({
      where: { id: createAuthDto.areaId },
    });

    if (!area) {
      throw new NotFoundException('El área especificada no existe');
    }

    // Verificar si el correo ya está registrado
    const existingUserByCorreo = await this.prisma.usuario.findUnique({
      where: { correo: createAuthDto.correo },
    });

    if (existingUserByCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Verificar si el documento ya está registrado
    const existingUserByDocumento = await this.prisma.usuario.findUnique({
      where: { documento: createAuthDto.documento },
    });

    if (existingUserByDocumento) {
      throw new ConflictException('El documento ya está registrado');
    }

    // Verificar si el teléfono ya está registrado (si se proporciona)
    if (createAuthDto.telefono) {
      const existingUserByTelefono = await this.prisma.usuario.findUnique({
        where: { telefono: createAuthDto.telefono },
      });

      if (existingUserByTelefono) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createAuthDto.contrasena, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        ...createAuthDto,
        contrasena: hashedPassword,
      },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        area: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = usuario;

    return {
      data: userWithoutPassword,
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

    return { data: userWithoutPassword, message: 'Inicio de sesion Exitoso' };
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
        tipoDocumento: true,
        documento: true,
        telefono: true,
        estado: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        area: {
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
      select: {
        id: true,
        correo: true,
        nombre: true,
        apellido: true,
        tipoDocumento: true,
        documento: true,
        telefono: true,
        estado: true,
        areaId: true,
        rolId: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        area: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar si el rol existe (si se está actualizando)
    if (updateAuthDto.rolId) {
      const rol = await this.prisma.rol.findUnique({
        where: { id: updateAuthDto.rolId },
      });

      if (!rol) {
        throw new NotFoundException('El rol especificado no existe');
      }
    }

    // Verificar si el área existe (si se está actualizando)
    if (updateAuthDto.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: updateAuthDto.areaId },
      });

      if (!area) {
        throw new NotFoundException('El área especificada no existe');
      }
    }

    // Verificar si el correo ya está registrado por otro usuario
    if (updateAuthDto.correo && updateAuthDto.correo !== usuario.correo) {
      const existingUserByCorreo = await this.prisma.usuario.findUnique({
        where: { correo: updateAuthDto.correo },
      });

      if (existingUserByCorreo && existingUserByCorreo.id !== id) {
        throw new ConflictException('El correo ya está registrado por otro usuario');
      }
    }

    // Verificar si el documento ya está registrado por otro usuario
    if (updateAuthDto.documento && updateAuthDto.documento !== usuario.documento) {
      const existingUserByDocumento = await this.prisma.usuario.findUnique({
        where: { documento: updateAuthDto.documento },
      });

      if (existingUserByDocumento && existingUserByDocumento.id !== id) {
        throw new ConflictException('El documento ya está registrado por otro usuario');
      }
    }

    // Verificar si el teléfono ya está registrado por otro usuario
    if (updateAuthDto.telefono && updateAuthDto.telefono !== usuario.telefono) {
      const existingUserByTelefono = await this.prisma.usuario.findUnique({
        where: { telefono: updateAuthDto.telefono },
      });

      if (existingUserByTelefono && existingUserByTelefono.id !== id) {
        throw new ConflictException('El teléfono ya está registrado por otro usuario');
      }
    }

    // Preparar datos para actualizar
    const data: any = { ...updateAuthDto };

    // Hash de la contraseña si se proporciona
    if (updateAuthDto.contrasena) {
      data.contrasena = await bcrypt.hash(updateAuthDto.contrasena, 10);
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data,
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        area: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = updatedUser;

    return {
      data: userWithoutPassword,
      message: 'Usuario actualizado correctamente',
    };
  }

  async delete(id: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Eliminar usuario
    await this.prisma.usuario.delete({ where: { id } });

    return {
      data: null,
      message: 'Usuario eliminado correctamente',
    };
  }
}
