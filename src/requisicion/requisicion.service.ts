import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { UpdateRequisicionDto } from './dto/update-requisicion.dto';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCommentDto } from '@/requisicion/dto/create-comment.dto';
import { RechazarRequisicionDto } from '@/requisicion/dto/rechazar-requizicion.dto';

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

    const comprometido = await this.prisma.requisicion.aggregate({
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
      throw new NotFoundException('No se encontraron requisiciones para el periodo ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulos[0];
      const valorTotal = articulo ? Number(articulo.cantidad) * Number(articulo.valorUnitario) : 0;

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
        fecha: req.createdAt.toISOString(),
        estado: req.estado,
        proveedor: req.proveedor?.nombre || 'Sin proveedor',
        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',
        cantidad: articulo?.cantidad || 0,
        valor: valorTotal.toFixed(2),
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
      throw new NotFoundException('No se encontraron requisiciones para el periodo ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulos[0];

      return {
        id: req.id,
        area: req.area.nombre,
        fecha: req.createdAt.toISOString(),
        estado: req.estado,

        solicitanteId: req.usuarioId,
        solicitante: req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : 'N/A',

        proveedor: req.proveedor?.nombre || 'Sin proveedor',

        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',

        cantidad: articulo?.cantidad || 0,
        valorPresupuestado: req.valorPresupuestado,

        comentario: req.comentario,
        motivoRechazo: req.motivoRechazo,
        justificacion: req.justificacion,
        ivaPresupuestado: req.ivaPresupuestado || 0,
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
        `Esta requisición ya tiene ${existentes} soporte(s). Solo puede agregar ${3 - existentes} más`,
      );
    }

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
  }

  async aprobarRequisicion(id: number, dto: UpdateRequisicionDto) {
    const soportes = await this.prisma.soporteCotizacion.count({
      where: { requisicionId: id },
    });

    if (soportes < 1) {
      throw new BadRequestException(
        'La requisición debe tener al menos 1 soporte para ser aprobada',
      );
    }

    const data = await this.prisma.requisicion.update({
      where: { id },
      data: { ...dto, estado: 'APROBADA' },
    });

    //actualizar el presupuesto del area
    await this.prisma.presupuesto.update({
      where: {
        areaId_periodo: {
          areaId: data.areaId,
          periodo: data.periodo,
        },
      },
      data: {
        saldoDisponible: { decrement: data.valorPresupuestado },
        totalGastado: { increment: data.valorDefinido ?? 0 },
        montoComprometido: { decrement: data.valorDefinido ?? 0 },
      },
    });

    //actualizar el presupuesto general
    await this.prisma.presupuestoGeneral.update({
      where: { periodo: data.periodo },
      data: {
        saldoDisponible: { decrement: data.valorPresupuestado },
        presupuestoTotal: { increment: data.valorDefinido ?? 0 },
        montoComprometido: { decrement: data.valorDefinido ?? 0 },
      },
    });

    return {
      data,
      message: 'Requisicion aprobada con exito',
    };
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
    return {
      data,
      message: 'Requisicion rechazada con exito',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} requisicion`;
  }
}
