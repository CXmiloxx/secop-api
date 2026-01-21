import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CajaMenorService } from './caja-menor.service';
import { CreateCajaMenorDto } from './dto/create-caja-menor.dto';
import { UpdateCajaMenorDto } from './dto/update-caja-menor.dto';
import { SolicitarPresupuestoDto } from './dto/solicitar-presupuesto.dto';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cajaMenorMulterConfig } from '@/config/multer.config';
import { AprobarPresupuestoDto } from './dto/aprobar-presupuesto.dto';

@Controller('caja-menor')
export class CajaMenorController {
  constructor(private readonly cajaMenorService: CajaMenorService) {}

  @Post()
  create(@Body() createCajaMenorDto: CreateCajaMenorDto) {
    return this.cajaMenorService.create(createCajaMenorDto);
  }
  @Post('solicitar-presupuesto')
  solicitarPresupuesto(@Body() solicitarPresupuestoDto: SolicitarPresupuestoDto) {
    return this.cajaMenorService.solicitarReposicionCajaMenor(solicitarPresupuestoDto);
  }

  @Patch('aprobar-presupuesto')
  aprobarPresupuesto(@Body() aprobarPresupuestoDto: AprobarPresupuestoDto) {
    return this.cajaMenorService.aprobarReposicionCajaMenor(aprobarPresupuestoDto);
  }

  @Post('asignar-presupuesto/:id')
  asignarPresupuesto(
    @Param('id') id: number,
    @Body() { montoSolicitado, justificacion }: { montoSolicitado: number; justificacion: string },
  ) {
    return this.cajaMenorService.asignarPresupuestoDirecto(id, montoSolicitado, justificacion);
  }

  @Get(':periodo')
  findAll(@Param('periodo') periodo: number) {
    return this.cajaMenorService.findAll(periodo);
  }

  @Get('historial/:cajaMenorId')
  async historial(@Param('cajaMenorId') cajaMenorId: number) {
    return await this.cajaMenorService.historialCajaMenor(cajaMenorId);
  }

  @Post('registrar-gasto')
  @UseInterceptors(FileInterceptor('soporteFactura', cajaMenorMulterConfig))
  registrarMovimiento(
    @Body() crearMovimientoDto: CrearMovimientoDto,
    @UploadedFile() soporteFactura: Express.Multer.File | undefined,
  ) {
    return this.cajaMenorService.registrarGastoCajaMenor(crearMovimientoDto, soporteFactura);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cajaMenorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCajaMenorDto: UpdateCajaMenorDto) {
    return this.cajaMenorService.update(+id, updateCajaMenorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cajaMenorService.remove(+id);
  }
}
