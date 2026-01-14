import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RequisicionService } from './requisicion.service';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { UpdateRequisicionDto } from './dto/update-requisicion.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cotizacionMulterConfig } from '@/config/multer.config';
import { CreateCommentDto } from '@/requisicion/dto/create-comment.dto';
import { RechazarRequisicionDto } from '@/requisicion/dto/rechazar-requizicion.dto';

@Controller('requisicion')
export class RequisicionController {
  constructor(private readonly requisicionService: RequisicionService) {}

  @Post()
  create(@Body() createRequisicionDto: CreateRequisicionDto) {
    return this.requisicionService.create(createRequisicionDto);
  }

  @Get()
  async findAllByArea(@Query('areaId') areaId: number, @Query('periodo') periodo: number) {
    return await this.requisicionService.findAllByArea(areaId, periodo);
  }

  @Get('all')
  async findAll(@Query('periodo') periodo: number) {
    return await this.requisicionService.findAll(periodo);
  }

  @Post('comentario/:requiscionId')
  async createComments(
    @Param('requiscionId') idRreqiscion: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.requisicionService.createComments(+idRreqiscion, createCommentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisicionService.findOne(+id);
  }

  @Patch('aprobar/:id')
  aprobarRequisicion(@Param('id') id: string, @Body() updateRequisicionDto: UpdateRequisicionDto) {
    return this.requisicionService.aprobarRequisicion(+id, updateRequisicionDto);
  }

  @Post('soportes-cotizacion/:requisicionId')
  @UseInterceptors(FilesInterceptor('files', 3, cotizacionMulterConfig))
  async createSoportes(
    @Param('requisicionId') requisicionId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.requisicionService.createSoportes(requisicionId, files);
  }

  @Patch('soportes-cotizacion/:requisicionId')
  @UseInterceptors(FilesInterceptor('files', 3, cotizacionMulterConfig))
  async actualizarSoportes(
    @Param('requisicionId') requisicionId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.requisicionService.actualizarSoportesCotizaciones(requisicionId, files);
  }

  @Patch('rechazar/:requisicionId')
  async rechazarRequisicion(
    @Param('requisicionId') requisicionId: number,
    @Body() rechazarRequisicionDto: RechazarRequisicionDto,
  ) {
    return await this.requisicionService.rechazarRequisicion(requisicionId, rechazarRequisicionDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisicionDto: UpdateRequisicionDto) {
    return this.requisicionService.update(+id, updateRequisicionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisicionService.remove(+id);
  }
}
