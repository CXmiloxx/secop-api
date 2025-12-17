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
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { correo: registerDto.correo },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, 10);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        ...registerDto,
        contrasena: hashedPassword,
      },
      include: { rol: true, areas: true },
    });

    // Generar token
    const accessToken = this.generateToken(usuario.id, usuario.correo, usuario.rolId);

    return {
      data: {
        ...usuario,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: loginDto.correo },
      include: { rol: true, areas: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const { contrasena, ...userWithoutPassword } = usuario;

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.contrasena, contrasena);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const accessToken = this.generateToken(usuario.id, usuario.correo, usuario.rolId);

    return {
      data: {
        ...userWithoutPassword,
      },
      accessToken,
    };
  }

  async findByEmail(email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: email },
      include: { rol: true, areas: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
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

    return this.jwtService.sign(payload);
  }

  // Métodos CRUD originales
  async create(createAuthDto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.contrasena, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        ...createAuthDto,
        contrasena: hashedPassword,
      },
      include: { rol: true },
    });
    return usuario;
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      include: { rol: true },
    });
    return usuarios;
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
