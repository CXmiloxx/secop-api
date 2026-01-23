import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { pagoMulterConfig } from '@/config/multer.config';
import { EstadoRequisicion, TipoPago } from '@/generated/prisma/enums';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('soporteFactura', pagoMulterConfig))
  create(
    @Body() createPagoDto: CreatePagoDto,
    @UploadedFile() soporteFactura: Express.Multer.File | undefined,
  ) {
    return this.pagosService.create(createPagoDto, soporteFactura);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get('requisiciones')
  async findAllByEstado(
    @Query('periodo') periodo: number,
    @Query('estado') estado: EstadoRequisicion,
  ) {
    return await this.pagosService.findAllByEstado(periodo, estado);
  }
  @Patch('pasar-a-caja-menor/:id')
  pasarAPasaMenor(@Param('id') id: number) {
    return this.pagosService.pasarAPasaMenor(id);
  }

  @Get('solicitudes-caja-menor/:cajaMenorId')
  findAllSolicitudesCajaMenor(@Param('cajaMenorId') cajaMenorId: number) {
    return this.pagosService.findAllSolicitudesCajaMenor(cajaMenorId);
  }

  @Get('historial')
  async findAllHistorial(@Query('periodo') periodo: number, @Query('tipoPago') tipoPago: TipoPago) {
    return await this.pagosService.findAllHistorial(periodo, tipoPago);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
