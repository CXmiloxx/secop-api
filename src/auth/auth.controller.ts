import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { PrismaService } from '@prisma/prisma.service';
import { logger } from '@/common';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async users() {
    return this.authService.allUsers();
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('create-user')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Get('findAll/:param')
  @HttpCode(HttpStatus.OK)
  async findAll(@Param('param') param: keyof PrismaService) {
    logger.debug(param as string);
    return this.authService.findAll(param);
  }
}
