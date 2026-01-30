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
import { AuthResponse } from './interfaces/auth-response.interface';
import { Response } from 'express';
import { appConfig } from '@/config/app.config';

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

    //verificar si ya existe un usuario en el area
    const existingUserInArea = await this.prisma.usuario.findFirst({
      where: { areaId: createAuthDto.areaId },
    });

    if (existingUserInArea && existingUserInArea.estado === true) {
      throw new ConflictException(
        'Ya existe un usuario en el área, para registrar un nuevo usuario en el área, debe de desactivar el usuario existente',
      );
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

    const accessToken = this.generateAccessToken(usuario.id, usuario.correo, usuario.rolId);

    const refreshToken = this.generateRefreshToken(usuario.id);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, //1 hora
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 8, //8 horas
      path: '/',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = usuario;

    return { data: userWithoutPassword, message: 'Inicio de sesion Exitoso' };
  }

  async refreshToken(req: any, res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No se encontró el token de refresco');
    }

    // 1 Verificar token con try/catch
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    // 2 Validar que sea realmente un refresh token
    if (!decoded?.sub || decoded.type !== 'refresh') {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // 3 Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: {
        rol: { select: { id: true, nombre: true } },
        area: { select: { id: true, nombre: true } },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.estado === false) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    // 4 Generar nuevos tokens
    const accessToken = this.generateAccessToken(usuario.id, usuario.correo, usuario.rolId);

    const newRefreshToken = this.generateRefreshToken(usuario.id);

    // 5 Setear cookies con duraciones correctas
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1 hora
      path: '/',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
      path: '/',
    });

    //Retornar usuario sin contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userWithoutPassword } = usuario;

    return {
      data: null,
      message: 'Token de refresco exitoso',
    };
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

  private generateAccessToken(userId: string, correo: string, rolId: number): string {
    const payload = {
      sub: userId,
      correo,
      rolId,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: appConfig.expiresInJwt,
    });
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: appConfig.refreshExpiresInJwt,
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
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
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
      throw new NotFoundException('Usuario no encontrado');
    }

    // Desactivar usuario
    await this.prisma.usuario.update({ where: { id }, data: { estado: false } });

    return {
      data: null,
      message: 'Usuario desactivado correctamente',
    };
  }
}
