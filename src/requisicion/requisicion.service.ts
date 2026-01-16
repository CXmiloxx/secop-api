import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { UpdateRequisicionDto } from './dto/update-requisicion.dto';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCommentDto } from '@/requisicion/dto/create-comment.dto';
import { RechazarRequisicionDto } from '@/requisicion/dto/rechazar-requizicion.dto';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { logger } from '@/common';
@Injectable()
export class RequisicionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequisicionDto) {
    // Obtener el presupuesto aprobado para el producto/concepto en este periodo y área
    const producto = await this.prisma.producto.findUnique({
      where: {
        id: dto.productoId,
      },
      include: {
        conceptoContable: true,
      },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    const articuloPresupuesto = await this.prisma.articuloSolicitudPresupuesto.findFirst({
      where: {
        conceptoContableId: producto.conceptoContableId,
        solicitud: {
          areaId: dto.areaId,
          periodo: dto.periodo,
          estado: 'APROBADO',
        },
      },
    });

    if (!articuloPresupuesto || !articuloPresupuesto.valorAprobado) {
      throw new BadRequestException(
        'No existe un valor aprobado para este concepto en el área y periodo seleccionados',
      );
    }
    //validacion para el valor que puede solicitar por concepto
    /*     const comprometido = await this.prisma.requisicion.aggregate({
      _sum: {
        valorPresupuestado: true,
      },
      where: {
        areaId: dto.areaId,
        periodo: dto.periodo,
        articulos: {
          some: {
            producto: {
              conceptoContableId: producto.conceptoContableId,
            },
          },
        },
        estado: {
          not: 'RECHAZADA',
        },
      },
    });

    const totalComprometido = comprometido._sum.valorPresupuestado ?? 0;

    const disponible = Number(articuloPresupuesto.valorAprobado) - Number(totalComprometido);

    if (dto.valorPresupuestado > disponible) {
      throw new BadRequestException(
        `El valor de la requisición (${dto.valorPresupuestado}) excede el valor disponible para este concepto (${disponible})`,
      );
    } */

    const presupuestoDisponible = await this.prisma.presupuesto.findFirst({
      where: {
        areaId: dto.areaId,
        periodo: dto.periodo,
      },
      select: {
        saldoDisponible: true,
        montoComprometido: true,
      },
    });

    if (dto.valorPresupuestado > Number(presupuestoDisponible?.saldoDisponible)) {
      throw new BadRequestException(
        `El valor de la requisición (${dto.valorPresupuestado}) excede el valor disponible del area (${Number(presupuestoDisponible?.saldoDisponible)})`,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const requisicion = await tx.requisicion.create({
        data: {
          areaId: dto.areaId,
          proveedorId: dto.proveedorId ?? null,
          valorPresupuestado: dto.valorPresupuestado,
          ivaPresupuestado: dto.ivaPresupuestado ?? 0,
          justificacion: dto.justificacion,
          periodo: dto.periodo,
          usuarioId: dto.usuarioId,
        },
      });

      await tx.articuloRequisicion.create({
        data: {
          requisicionId: requisicion.id,
          productoId: dto.productoId,
          cantidad: dto.cantidad,
          valorUnitario: dto.valorUnitario,
        },
      });

      await tx.presupuesto.update({
        where: {
          areaId_periodo: {
            areaId: dto.areaId,
            periodo: dto.periodo,
          },
        },
        data: {
          saldoDisponible: { decrement: dto.valorPresupuestado },
          montoComprometido: { increment: dto.valorPresupuestado },
        },
      });

      await tx.presupuestoGeneral.update({
        where: { periodo: dto.periodo },
        data: {
          saldoDisponible: { decrement: dto.valorPresupuestado },
          montoComprometido: { increment: dto.valorPresupuestado },
        },
      });

      return {
        data: requisicion,
        message: 'Requisición creada con éxito',
      };
    });
  }

  async findAllByArea(areaId: number, periodo: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: {
        periodo,
        areaId,
      },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        proveedor: {
          select: {
            nombre: true,
          },
        },
        articulos: {
          include: {
            producto: {
              select: {
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (requisiciones.length === 0) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulos[0];

      const aprobadoPor =
        req.estado === 'APROBADA'
          ? [
              req.rector ? 'rector' : null,
              req.vicerrector ? 'vicerrector' : null,
              req.sindico ? 'sindico' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'N/A'
          : null;

      return {
        area: req.area.nombre,
        fechaSolicitud: req.createdAt.toISOString(),
        estado: req.estado,
        proveedor: req.proveedor?.nombre || 'Sin proveedor',
        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',
        cantidad: articulo?.cantidad || 0,
        valorPresupuestado: req.valorPresupuestado,
        valorDefinido: req.valorDefinido,
        ivaPresupuestado: req.ivaPresupuestado,
        ivaDefinido: req.ivaDefinido,
        justificacion: req.justificacion,
        aprobadoPor: aprobadoPor,
        motivoRechazo: req.motivoRechazo || null,
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas con exito',
    };
  }

  async findAll(periodo: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: { periodo },
      include: {
        area: {
          select: { nombre: true },
        },
        cotizaciones: {
          select: {
            soporteCotizacionPath: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        proveedor: {
          select: { nombre: true },
        },
        articulos: {
          include: {
            producto: {
              select: {
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (requisiciones.length === 0) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo: ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulos[0];
      const aprobadoPor =
        req.estado === 'APROBADA'
          ? [
              req.rector ? 'rector' : null,
              req.vicerrector ? 'vicerrector' : null,
              req.sindico ? 'sindico' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'N/A'
          : null;

      return {
        id: req.id,
        area: req.area.nombre,
        fechaSolicitud: req.createdAt.toISOString(),
        estado: req.estado,

        solicitanteId: req.usuarioId,
        solicitante: req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : 'N/A',

        proveedor: req.proveedor?.nombre || 'Sin proveedor',

        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',

        cantidad: articulo?.cantidad || 0,
        valorUnitario: articulo?.valorUnitario || 0,
        valorPresupuestado: req.valorPresupuestado,
        valorDefinido: req.valorDefinido,

        comentario: req.comentario,
        motivoRechazo: req.motivoRechazo,
        justificacion: req.justificacion,
        ivaPresupuestado: req.ivaPresupuestado || 0,
        aprobadoPor: aprobadoPor,
        daGarantia: req.daGarantia,
        tiempoGarantia: req.tiempoGarantia,
        soportesCotizaciones: req.cotizaciones.map((cotizacion) => ({
          path: cotizacion.soporteCotizacionPath,
        })),
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas exitosamente',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} requisicion`;
  }

  async createSoportes(requisicionId: number, files: Express.Multer.File[]) {
    const requisicion = await this.prisma.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion) {
      throw new NotFoundException('Requisición no encontrada');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Debe subir al menos un archivo');
    }

    if (files.length > 3) {
      throw new BadRequestException('Solo se pueden subir hasta 3 archivos');
    }

    const existentes = await this.prisma.soporteCotizacion.count({
      where: { requisicionId },
    });

    if (existentes + files.length > 3) {
      throw new BadRequestException(
        `Esta requisición ya tiene ${existentes} soporte(s). Solo puede agregar ${
          3 - existentes
        } más`,
      );
    }

    try {
      const soportesCreados = await this.prisma.$transaction(
        files.map((file) =>
          this.prisma.soporteCotizacion.create({
            data: {
              requisicionId,
              soporteCotizacionPath: file.path,
            },
          }),
        ),
      );

      return {
        data: soportesCreados,
        message: `${files.length} soporte(s) cargado(s) correctamente`,
        cantidad: files.length,
      };
    } catch (error) {
      for (const file of files) {
        if (file.path && existsSync(file.path)) {
          try {
            await unlink(file.path);
          } catch (e) {
            logger.error('Error eliminando archivo huérfano:', String(e), 'RequisicionService');
          }
        }
      }
      throw error;
    }
  }

  async actualizarSoportesCotizaciones(requisicionId: number, files: Express.Multer.File[]) {
    const requisicion = await this.prisma.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion) {
      throw new NotFoundException('Requisición no encontrada');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Debe subir al menos un archivo');
    }

    if (files.length > 3) {
      throw new BadRequestException('Solo se pueden subir hasta 3 archivos');
    }

    // 1 Obtener soportes antiguos
    const soportesAntiguos = await this.prisma.soporteCotizacion.findMany({
      where: { requisicionId },
    });

    // 2 Eliminar archivos físicos
    for (const soporte of soportesAntiguos) {
      if (soporte.soporteCotizacionPath && existsSync(soporte.soporteCotizacionPath)) {
        try {
          await unlink(soporte.soporteCotizacionPath);
        } catch (error) {
          logger.error(
            `No se pudo eliminar el archivo ${soporte.soporteCotizacionPath}`,
            String(error),
            'RequisicionService',
          );
        }
      }
    }

    // 3 Eliminar registros BD
    await this.prisma.soporteCotizacion.deleteMany({
      where: { requisicionId },
    });

    // 4 Crear nuevos soportes
    const nuevosSoportes = await this.prisma.$transaction(
      files.map((file) =>
        this.prisma.soporteCotizacion.create({
          data: {
            requisicionId,
            soporteCotizacionPath: file.path,
          },
        }),
      ),
    );

    return {
      data: nuevosSoportes,
      message: `${files.length} soporte(s) actualizado(s) correctamente`,
      cantidad: files.length,
    };
  }

  async aprobarRequisicion(id: number, dto: UpdateRequisicionDto) {
    return this.prisma.$transaction(async (tx) => {
      const soportes = await this.prisma.soporteCotizacion.findMany({
        where: { requisicionId: id },
      });

      if (soportes.length < 1) {
        throw new BadRequestException(
          'La requisición debe tener al menos un soporte de cotización para ser aprobada',
        );
      }

      const requisicion = await tx.requisicion.update({
        where: { id },
        data: { ...dto, estado: 'APROBADA' },
      });

      const totalOriginal = Number(requisicion.valorPresupuestado);
      const totalAprobado = Number(requisicion.valorDefinido ?? requisicion.valorPresupuestado);

      const diferencia = totalAprobado - totalOriginal;

      await tx.presupuesto.update({
        where: {
          areaId_periodo: {
            areaId: requisicion.areaId,
            periodo: requisicion.periodo,
          },
        },
        data: {
          montoComprometido: {
            increment: diferencia,
          },
          saldoDisponible: {
            decrement: diferencia,
          },
        },
      });

      await tx.presupuestoGeneral.update({
        where: { periodo: requisicion.periodo },
        data: {
          montoComprometido: {
            increment: diferencia,
          },
          saldoDisponible: {
            decrement: diferencia,
          },
        },
      });

      return {
        data: requisicion,
        message: 'Requisición aprobada correctamente',
      };
    });
  }

  async createComments(idRequisicion: number, dto: CreateCommentDto) {
    const requiscion = await this.prisma.requisicion.findUnique({
      where: { id: idRequisicion },
    });

    if (!requiscion) {
      throw new NotFoundException('Requisicion no encontrada');
    }

    const comentario = await this.prisma.requisicion.update({
      where: { id: idRequisicion },
      data: { comentario: dto.comentario },
    });

    if (!comentario) {
      throw new BadRequestException('Error al crear el comentario de la requiscion');
    }

    return {
      data: comentario,
      message: 'Comentario creado con exito',
    };
  }

  async update(id: number, updateRequisicionDto: UpdateRequisicionDto) {
    const data = await this.prisma.requisicion.update({
      where: { id },
      data: updateRequisicionDto,
    });
    return {
      data,
      message: 'Requisicion actualizada con exito',
    };
  }

  async rechazarRequisicion(requisicionId: number, dto: RechazarRequisicionDto) {
    const data = await this.prisma.requisicion.update({
      where: { id: requisicionId },
      data: { ...dto, estado: 'RECHAZADA' },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.presupuesto.update({
        where: {
          areaId_periodo: {
            areaId: data.areaId,
            periodo: data.periodo,
          },
        },
        data: {
          montoComprometido: { decrement: data.valorPresupuestado },
          saldoDisponible: { increment: data.valorPresupuestado },
        },
      });
      await tx.presupuestoGeneral.update({
        where: { periodo: data.periodo },
        data: {
          montoComprometido: { decrement: data.valorPresupuestado },
          saldoDisponible: { increment: data.valorPresupuestado },
        },
      });
    });
    return {
      data,
      message: 'Requisicion rechazada con exito',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} requisicion`;
  }
}
