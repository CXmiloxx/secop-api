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
import { UpdatePagoDto } from './dto/update-pago.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { pagoMulterConfig } from '@/config/multer.config';
import { EstadoRequisicion } from '@/generated/prisma/enums';

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
  @Post('pasar-a-caja-menor/:id')
  pasarAPasaMenor(@Param('id') id: number) {
    return this.pagosService.pasarAPasaMenor(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
