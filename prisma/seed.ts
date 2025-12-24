import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  const cuentaContables = await prisma.cuenta_contable.createMany({
    data: [
      {
        nombre: 'Actividades Relacionadas con Educación',
        id_tipo_cuenta_contable: 1,
        codigo: '4160',
      },
      {
        nombre: 'Actividades Conexas',
        id_tipo_cuenta_contable: 1,
        codigo: '4170',
      },
      {
        nombre: 'Descuentos',
        id_tipo_cuenta_contable: 1,
        codigo: '4175',
      },
      {
        nombre: 'Financieros',
        id_tipo_cuenta_contable: 2,
        codigo: '4210',
      },
      {
        nombre: 'UTILIDAD EN VENTA DE PROPIEDADES PLANTA Y EQUIPO',
        id_tipo_cuenta_contable: 1,
        codigo: '4245',
      },
      {
        nombre: 'Recuperaciones',
        id_tipo_cuenta_contable: 1,
        codigo: '4250',
      },
      {
        nombre: 'INDEMNIZACIONES',
        id_tipo_cuenta_contable: 1,
        codigo: '4255',
      },
      {
        nombre: 'Diversos',
        id_tipo_cuenta_contable: 1,
        codigo: '4295',
      },
      {
        nombre: 'GASTOS DE PERSONAL',
        id_tipo_cuenta_contable: 4,
        codigo: '5105',
      },
      {
        nombre: 'HONORARIOS',
        id_tipo_cuenta_contable: 4,
        codigo: '5110',
      },
      {
        nombre: 'IMPUESTOS',
        id_tipo_cuenta_contable: 4,
        codigo: '5115',
      },
      {
        nombre: 'ARRENDAMIENTO',
        id_tipo_cuenta_contable: 4,
        codigo: '5120',
      },
      {
        nombre: 'CONTRIBUCIONES Y AFILIACIONES',
        id_tipo_cuenta_contable: 4,
        codigo: '5125',
      },
      {
        nombre: 'SEGUROS',
        id_tipo_cuenta_contable: 4,
        codigo: '5130',
      },
      {
        nombre: 'SERVICIOS',
        id_tipo_cuenta_contable: 4,
        codigo: '5135',
      },
      {
        nombre: 'OTROS',
        id_tipo_cuenta_contable: 4,
        codigo: '513595',
      },
      {
        nombre: 'GASTOS LEGALES',
        id_tipo_cuenta_contable: 4,
        codigo: '5140',
      },
      {
        nombre: 'MANTENIMIENTO Y REPARACIONES',
        id_tipo_cuenta_contable: 4,
        codigo: '5145',
      },
      {
        nombre: 'ADECUACION E INSTALACIONES',
        id_tipo_cuenta_contable: 4,
        codigo: '5150',
      },
      {
        nombre: 'GASTOS DE VIAJE',
        id_tipo_cuenta_contable: 4,
        codigo: '5155',
      },
      {
        nombre: 'DEPRECIACIONES',
        id_tipo_cuenta_contable: 4,
        codigo: '5160',
      },
      {
        nombre: 'LICENCIAS',
        id_tipo_cuenta_contable: 4,
        codigo: '5165',
      },
      {
        nombre: 'DIVERSOS',
        id_tipo_cuenta_contable: 4,
        codigo: '5195',
      },
      {
        nombre: 'LIBROS SUSCRIPCIONES Y PERIODICOS',
        id_tipo_cuenta_contable: 4,
        codigo: '519510',
      },
      {
        nombre: 'GASTOS DE REPRESENTACION Y RELACIONES PUBLICAS',
        id_tipo_cuenta_contable: 4,
        codigo: '519520',
      },
      {
        nombre: 'ELEMENTOS DE ASEO Y CAFETERIA',
        id_tipo_cuenta_contable: 4,
        codigo: '519525',
      },
      {
        nombre: 'UTILES PAPELERIA Y FOTOCOPIAS',
        id_tipo_cuenta_contable: 4,
        codigo: '519530',
      },
      {
        nombre: 'COMBUSTIBLES Y LUBRICANTES',
        id_tipo_cuenta_contable: 4,
        codigo: '519535',
      },
      {
        nombre: 'TAXIS Y BUSES',
        id_tipo_cuenta_contable: 4,
        codigo: '519545',
      },
      {
        nombre: 'CASINO Y RESTAURANTE',
        id_tipo_cuenta_contable: 4,
        codigo: '519560',
      },
      {
        nombre: 'PARQUEADEROS',
        id_tipo_cuenta_contable: 4,
        codigo: '519565',
      },
      {
        nombre: 'INDEMNIZACION',
        id_tipo_cuenta_contable: 4,
        codigo: '519570',
      },
      {
        nombre: 'DIVERSOS',
        id_tipo_cuenta_contable: 4,
        codigo: '519595',
      },
      {
        nombre: 'GATOS CASAS, CONVENTOS, COLEGIOS',
        id_tipo_cuenta_contable: 4,
        codigo: '51959502',
      },
      {
        nombre: 'TRANSFERENCIA ENTRE ENTIDADES',
        id_tipo_cuenta_contable: 4,
        codigo: '51959504',
      },
      {
        nombre: 'OTROS',
        id_tipo_cuenta_contable: 4,
        codigo: '51959505',
      },
      {
        nombre: 'PROVISIONES',
        id_tipo_cuenta_contable: 4,
        codigo: '5199',
      },
      {
        nombre: 'FINANCIEROS',
        id_tipo_cuenta_contable: 5,
        codigo: '5305',
      },
      {
        nombre: 'PERDIDA EN VENTA Y RETIRO DE BIENES',
        id_tipo_cuenta_contable: 5,
        codigo: '5310',
      },
      {
        nombre: 'GASTOS EXTRAORDINARIOS',
        id_tipo_cuenta_contable: 5,
        codigo: '5315',
      },
      {
        nombre: 'GASTOS DIVERSOS',
        id_tipo_cuenta_contable: 5,
        codigo: '5395',
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
