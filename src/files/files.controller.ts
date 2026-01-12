import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class FilesController {
  private readonly allowedFolders = ['cotizaciones', 'facturas', 'pagos', 'imagenes', 'documentos'];

  @Get(':folder/:filename')
  getFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Validar que la carpeta esté permitida
    if (!this.allowedFolders.includes(folder)) {
      throw new BadRequestException('Carpeta no válida');
    }

    // Validar que el nombre de archivo no contenga caracteres peligrosos
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Nombre de archivo no válido');
    }

    const filePath = join(process.cwd(), 'uploads', folder, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return res.sendFile(filePath);
  }
}
