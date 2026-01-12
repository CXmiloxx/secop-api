import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly uploadsDir = './uploads';

  /**
   * Elimina un archivo del sistema
   * @param folder - Carpeta dentro de uploads
   * @param filename - Nombre del archivo
   */
  deleteFile(folder: string, filename: string): void {
    const filePath = join(this.uploadsDir, folder, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    unlinkSync(filePath);
  }

  /**
   * Extrae el nombre del archivo de una ruta completa
   * @param path - Ruta completa del archivo
   */
  getFilenameFromPath(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || '';
  }

  /**
   * Obtiene la carpeta de una ruta completa
   * @param path - Ruta completa del archivo
   */
  getFolderFromPath(path: string): string {
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 2] || '';
  }

  /**
   * Verifica si un archivo existe
   * @param folder - Carpeta dentro de uploads
   * @param filename - Nombre del archivo
   */
  fileExists(folder: string, filename: string): boolean {
    const filePath = join(this.uploadsDir, folder, filename);
    return existsSync(filePath);
  }

  /**
   * Obtiene la ruta completa de un archivo
   * @param folder - Carpeta dentro de uploads
   * @param filename - Nombre del archivo
   */
  getFilePath(folder: string, filename: string): string {
    return join(process.cwd(), this.uploadsDir, folder, filename);
  }
}

