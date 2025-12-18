import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear rol
  const rol = await prisma.rol.create({
    data: {
      nombre: 'Admin',
      descripcion: 'Administrador del sistema',
    },
  });
  console.log('✅ Rol creado:', rol.nombre);

  // Crear usuario
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Camilo',
      correo: 'camilo@example.com',
      contrasena: '$2a$12$h8SjvYvM.VtLpyTitkxpqOWeqdxRY8zaj9A0IFagGnXNfSJL6Uo6.',
      apellido: 'Guapacha',
      tipo_documento: 'CEDULA',
      documento: '1234567890',
      telefono: '1234567890',
      rolId: rol.id,
    },
  });
  console.log('✅ Usuario creado:', usuario.nombre);

  // Crear área
  const area = await prisma.area.create({
    data: {
      nombre: 'Area 1',
      descripcion: 'Area 1 del sistema',
      idUsuario: usuario.id,
    },
  });
  console.log('✅ Área creada:', area.nombre);

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
