import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

/* const cuentaContable = await prisma.cuenta_contable.createMany({
  data: [
    {
      id: 1,
      nombre: 'Material Didáctico',
      codigo: '5010',
    },
    {
      id: 2,
      nombre: 'Papelería y Útiles de Oficina',
      codigo: '5020',
    },
    {
      id: 3,
      nombre: 'Servicios Generales',
      codigo: '5030',
    },
    {
      id: 4,
      nombre: 'Tecnología e Informática',
      codigo: '5040',
    },
    {
      id: 5,
      nombre: 'Material Deportivo',
      codigo: '5050',
    },
    {
      id: 6,
      nombre: 'Mobiliario y Equipo',
      codigo: '5060',
    },
    {
      id: 7,
      nombre: 'Servicios Públicos',
      codigo: '5070',
    },
  ],
}); */

/*   const conceptoContable = await prisma.concepto_contable.createMany({
    data: [
      {
        id: 1,
        nombre: 'Cartulinas',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Marcadores',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Pinturas',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Material de laboratorio',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Libros de texto',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Resmas de papel',
        id_cuenta_contable: 1,
      },
      {
        id: 1,
        nombre: 'Resmas de papel',
        id_cuenta_contable: 2,
      },
      {
        id: 2,
        nombre: 'Bolígrafos',
        id_cuenta_contable: 2,
      },
      {
        id: 3,
        nombre: 'Carpetas',
        id_cuenta_contable: 2,
      },
      {
        id: 4,
        nombre: 'Grapas y clips',
        id_cuenta_contable: 2,
      },
      {
        id: 5,
        nombre: 'Cuadernos',
        id_cuenta_contable: 2,
      },
      {
        id: 6,
        nombre: 'Archivadores',
        id_cuenta_contable: 2,
      },
      {
        id: 7,
        nombre: 'Servicios Públicos',
        id_cuenta_contable: 2,
      },
    ],
  }); */

async function main() {
  console.log('🌱 Iniciando seed...');

  const proveedores = await prisma.proveedor.createMany({
    data: [
      {
        nit: '900166682-0',
        nombre: 'IPS HUMANE FINE',
        tipo_insumo: 'EXAMENES MEDICOS OCUPACIONALES',
        responsable: 'IPS HUMANFINE S.A.S',
        correo: 'contabilidad@humanfine.com',
        telefono: '5136468',
      },
      {
        nit: '800136505-4',
        nombre: 'DATECSA SA',
        tipo_insumo: 'OUTSOURCING DE IMPRESIÓN',
        responsable: 'DARIO APONTE MERA',
        correo: 'christiansalazar@datecsa.com',
        telefono: '3325706',
      },
      {
        nit: '900304856-8',
        nombre: 'INTELLIGENCE IT SAS',
        tipo_insumo: 'COMPUTADORES Y LICENCIAS',
        responsable: 'INTELLIGENCE IT',
        correo: 'coordadm@iit.net.co',
        telefono: '4399980',
      },
      {
        nit: '900682841-8',
        nombre: 'GRUPO EDITORIAL NORMA',
        tipo_insumo: 'EDITORIAL',
        responsable: 'GRUPO EDITORIAL NORMA',
        correo: 'yrincon@edicionesnorma.com',
        telefono: '5186655',
      },
      {
        nit: '1107047107',
        nombre: 'CAFETERIA ORESTE WOK EXPRESS',
        tipo_insumo: 'CAFETERIA',
        responsable: 'LEYDY VIVIANA ESCOBAR',
        correo: 'leydy12388@hotmail.com',
        telefono: '3165343587',
      },
      {
        nit: '805021410-7',
        nombre: 'TRANSPORTES CALICONFORT',
        tipo_insumo: 'TRANSPORTE',
        responsable: 'TRANSPORTES CALICONFORT',
        correo: 'contabilidad@caliconfort.com',
        telefono: '3304621',
      },
      {
        nit: '31849340',
        nombre: 'DIPLOMAS E IMPRESOS ARTEMISA',
        tipo_insumo: 'DIPLOMAS DE BACHILLER',
        responsable: 'VILLAVIGETH LERMA GUTIERREZ',
        correo: 'diplomasartemisa@gmail.com',
        telefono: '5586997 / 3172276929',
      },
      {
        nit: '94556479',
        nombre: 'LEONARDO STIVEN CAGUAZANGO',
        tipo_insumo: 'MEDALLERIA Y TROFEOS',
        responsable: 'TROFEOS Y TROFEOS',
        correo: 'rincon7774@hotmail.com',
        telefono: '4337777',
      },
      {
        nit: '805010247-5',
        nombre: 'LITOCENTER',
        tipo_insumo: 'PUBLICIDAD',
        responsable: 'JUAN FELIPE VERNAZA F',
        correo: 'litocenter@emcali.net.co',
        telefono: '8802242',
      },
      {
        nit: '890332081-0',
        nombre: 'CONFECCIONES GAZZIA S.A.S',
        tipo_insumo: 'UNIFORMES ESCOLARES',
        responsable: 'CONFECCIONES GAZZIA',
        correo: 'contabilidad@gazziadotaciones.com',
        telefono: '3183588584',
      },
      {
        nit: '16378024',
        nombre: 'IVAN VELASQUEZ',
        tipo_insumo: 'SEGURIDAD Y SALUD EN EL TRABAJO',
        responsable: 'IVAN VELASQUEZ',
        correo: 'ivan.consultorsst@gmail.com',
        telefono: '3152909723',
      },
      {
        nit: '55063891',
        nombre: 'SKP ESCUELA DE FORMACIÓN',
        tipo_insumo: 'ESCUELAS DE FORMACIÓN',
        responsable: 'CLAUDIA LILIANA CACERES',
        correo: 'skp@lacordaire.edu.co',
        telefono: '3164084694',
      },
      {
        nit: '79261499',
        nombre: 'JOSE LUIS ORTEGA DELGADO',
        tipo_insumo: 'ABOGADO',
        responsable: 'JOSE LUIS ORTEGA DELGADO',
        correo: 'joseluisortega64@hotmail.com',
        telefono: '3206958927',
      },
      {
        nit: '901010913-0',
        nombre: 'SERVICIOS LINGUISTICOS',
        tipo_insumo: 'EXAMENES CAMBRIDGE',
        responsable: 'PATRICIA',
        correo: 'patricia.molina@ihbogota.com, jeniffer.arismendy@ihbogota.com',
        telefono: '7931993',
      },
      {
        nit: '900914013-3',
        nombre: 'BIOLAB DEL VALLE S.A.S',
        tipo_insumo: 'ANALISIS MICROBIOLOGICO',
        responsable: 'BIOLAB DEL VALLE S.A.S',
        correo: 'biolabdelvalle@gmail.com',
        telefono: '3251036',
      },
      {
        nit: '901861940-0',
        nombre: 'FERRETOOLS',
        tipo_insumo: 'ARTICULOS ELECTRICOS',
        responsable: 'FERRETOOLS',
        correo: 'comercial@ferretools.com.co',
        telefono: '3132798393',
      },
      {
        nit: '900760072-5',
        nombre: 'KILL PEST CONTROL Y PREVENCIÓN DE PLAGAS S.A.S',
        tipo_insumo: 'FUMIGACIÓN',
        responsable: 'LUIS ALBERTO OSPINA',
        correo: 'killpestcontrol@gmail.com',
        telefono: '8882081 / 3127084876',
      },
      {
        nit: ' 805023753 -7',
        nombre: 'MISIÓN AMBIENTAL SAS',
        tipo_insumo: 'RECOLECCIÓN DE BASURA',
        responsable: 'MISIÓN AMBIENTAL',
        correo: 'misionambientalsa@yahoo.com',
        telefono: '4393792',
      },
      {
        nit: ' 890917141 -6',
        nombre: 'SEGURIDAD ATEMPI DE COLOMBIA',
        tipo_insumo: 'SERVICIO DE VIGILANCIA',
        responsable: 'ATEMPI',
        correo: 'jesus.riascos@atempi.co',
        telefono: '6042004220',
      },
      {
        nit: ' 901078623 -2',
        nombre: 'DISTRIVELEZ',
        tipo_insumo: 'ARTICULOS DE ASEO',
        responsable: 'PILAR',
        correo: 'ventas2@distrivelez.com',
        telefono: '5249090/3798587/319 384 21 22',
      },
      {
        nit: ' 900280292 -9',
        nombre: 'COMERCIALIZADORA LA EFICAZ',
        tipo_insumo: 'ARTICULOS DE ASEO, PAPELERIA',
        responsable: 'JHON JAIRO',
        correo: 'ventas3@cmlaeficaz.com',
        telefono: '6024399980',
      },
      {
        nit: ' 900781788 -1',
        nombre: 'ADVANCE ELECTRIC',
        tipo_insumo: 'SERVICIOS ELECTRICOS',
        responsable: 'MESIAS OROZCO',
        correo: 'advanceingenieria@hotmail.com',
        telefono: '3455210',
      },
      {
        nit: ' 1130614760',
        nombre: 'GUSTAVO ADOLFO VILLAMIL',
        tipo_insumo: 'ARTICULOS FERRETERIA',
        responsable: 'ANA MARIA Y GUSTAVO VILLAMIL',
        correo: 'villamilga26@gmail/ferromaterialesvillamil@gamil.com',
        telefono: '3182695600',
      },
      {
        nit: ' 16918428',
        nombre: 'AIRES MILENIUM',
        tipo_insumo: 'MANTENIMIENTO AIRES ACONDICIONADOS',
        responsable: 'CARLOS CORTES',
        correo: 'airesmillenium@gmail.com/ carloscar24@gmail.com',
        telefono: '3164823750',
      },
      {
        nit: ' 901065339- 9',
        nombre: 'SERVICIOS AMBIENTALES GENERALES DE COLOMBIA',
        tipo_insumo: 'RECOLECCION DE RESIDUOS PELIGROSOS',
        responsable: 'SERVICIOS AMBIENTALES GENERALES DE COLOMBIA',
        correo: 'servicioambientalintegral@gmail.com',
        telefono: '3203818264',
      },
      {
        nit: ' 31933339',
        nombre: 'YOLANDA BUSTAMANTE',
        tipo_insumo: 'TECNOLOGIA ',
        responsable: 'GILBERTO OSORIO',
        correo: 'gurutecnologicocali@gmail.com',
        telefono: '3193352161',
      },
      {
        nit: ' 901439406',
        nombre: 'REPRESENTACIONES PREX',
        tipo_insumo: 'LIBROS, MATERIALES Y ARTICULOS DE  PAPELERIA',
        responsable: 'REPRESENTACIONES PREX',
        correo: 'info@prex.com.co',
        telefono: '5142194/ 5142198/ 5573143',
      },
      {
        nit: ' 860035467 -7',
        nombre: 'PRUEBAS PSICOLOGICAS',
        tipo_insumo: 'PSICOLOGOS ESPECIALISTAS ASOCIADOS S.A.S',
        responsable: 'REPRESENTACIONES PREX',
        correo: 'contabilidad@pseaconsultores.com',
        telefono: '60126354774',
      },
      {
        nit: ' 805004110 -0',
        nombre: 'UNIESCOLAR PAPELERIA LTDA',
        tipo_insumo: 'ARTICULOS DE PAPELERIA',
        responsable: 'UNIESCOLAR PAPELERIA LTDA',
        correo: 'uniescolarpapeleria@hotmail.com',
        telefono: '3148424755',
      },
      {
        nit: ' 860028580 -2',
        nombre: 'DISTRIBUIDORA DE PAPELES DISPAPELES',
        tipo_insumo: 'PRODUCTOS DE PAPELERIA INSTITUCIONAL',
        responsable: 'JULIAN ALVAREZ',
        correo: 'cali.comercial65@dispapeles.com',
        telefono: '8838888',
      },
      {
        nit: '901177358 -1',
        nombre: 'SABER PARA TODOS -EDUCATE',
        tipo_insumo: 'PRUEBAS CAMBRIDGE',
        responsable: 'SABER PARA TODOS -EDUCATE',
        correo: 'contabilidadcali@educateparaelsaber.edu.co /saberparatodoscali@gmail.com',
        telefono: '3234373211',
      },
      {
        nit: '901439406-0',
        nombre: 'ELECTROILUMINACIONES FARALLONES',
        tipo_insumo: 'ARTICULOS ELECTRICOS',
        responsable: 'ELECTROILUMINACIONES FARALLONES',
        correo: 'electroiluminacionesefe@gmail.com',
        telefono: '5229942',
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
