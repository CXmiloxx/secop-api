import { diskStorage, StorageEngine } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';

type FileFilterCallback = (error: any, acceptFile: boolean) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

// Tipos de archivos permitidos
export enum TipoArchivo {
  IMAGEN = 'imagen',
  DOCUMENTO = 'documento',
  TODOS = 'todos',
}

// Configuración de formatos permitidos
const FORMATOS_CONFIG = {
  [TipoArchivo.IMAGEN]: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    errorMessage: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP)',
  },
  [TipoArchivo.DOCUMENTO]: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    errorMessage: 'Solo se permiten documentos (PDF, DOC, DOCX, XLS, XLSX)',
  },
  [TipoArchivo.TODOS]: {
    extensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
    ],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    errorMessage: 'Formato de archivo no permitido',
  },
};

const UPLOADS_DIR = './uploads';

// Asegurar que el directorio base existe solo si está permitido (permiso true por defecto)
function asegurarDirectorio(path: string, permitido = true) {
  if (permitido && !existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

// Por defecto, permitimos la creación del directorio base
asegurarDirectorio(UPLOADS_DIR, true);

/**
 * Crea una configuración de Multer personalizada
 * @param subdir - Subdirectorio dentro de uploads (ej: 'cotizaciones', 'facturas', 'pagos')
 * @param prefix - Prefijo para el nombre del archivo (ej: 'soporte', 'factura', 'pago')
 * @param tipoArchivo - Tipo de archivos permitidos
 * @param maxFileSize - Tamaño máximo en MB (default: 10)
 * @param maxFiles - Número máximo de archivos (default: 3)
 * @param permiteCrearCarpeta - Permitir crear nueva carpeta si no existe (default: true)
 */
export function createMulterConfig(
  subdir: string,
  prefix: string,
  tipoArchivo: TipoArchivo = TipoArchivo.TODOS,
  maxFileSize: number = 10,
  maxFiles: number = 3,
  permiteCrearCarpeta: boolean = true,
): MulterOptions {
  const uploadPath = join(UPLOADS_DIR, subdir);

  // Solo crea subdirectorio si está permitido
  asegurarDirectorio(uploadPath, permiteCrearCarpeta);

  const storage: StorageEngine = diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: FilenameCallback) => {
      // Verificar otra vez si lo desea
      if (permiteCrearCarpeta && !existsSync(uploadPath)) {
        try {
          mkdirSync(uploadPath, { recursive: true });
        } catch (error) {
          return callback(new Error(`No se pudo crear el directorio para uploads: ${error}`), '');
        }
      }
      callback(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, callback: FilenameCallback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname).toLowerCase();
      const sanitizedName = file.originalname
        .replace(ext, '')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .substring(0, 50);
      callback(null, `${prefix}-${sanitizedName}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ): void => {
    const config = FORMATOS_CONFIG[tipoArchivo];
    const ext = extname(file.originalname).toLowerCase();

    if (!config.extensions.includes(ext) || !config.mimeTypes.includes(file.mimetype)) {
      return callback(new BadRequestException(config.errorMessage), false);
    }

    callback(null, true);
  };

  return {
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize * 1024 * 1024,
      files: maxFiles,
    },
  };
}

// Configuraciones predefinidas para diferentes tipos de archivos
export const cotizacionMulterConfig = createMulterConfig(
  'cotizaciones',
  'soporte',
  TipoArchivo.TODOS,
  10,
  3,
  true, // Permitir crear carpeta si no existe
);

export const facturaMulterConfig = createMulterConfig(
  'facturas',
  'factura',
  TipoArchivo.TODOS,
  10,
  5,
  true,
);

export const pagoMulterConfig = createMulterConfig('pagos', 'pago', TipoArchivo.TODOS, 10, 5, true);

export const imagenMulterConfig = createMulterConfig(
  'imagenes',
  'imagen',
  TipoArchivo.IMAGEN,
  5,
  10,
  true,
);

export const documentoMulterConfig = createMulterConfig(
  'documentos',
  'documento',
  TipoArchivo.DOCUMENTO,
  15,
  10,
  true,
);
