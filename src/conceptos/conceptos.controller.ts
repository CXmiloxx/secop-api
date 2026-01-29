import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Controller('conceptos')
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Post()
  create(@Body() createConceptoDto: CreateConceptoDto) {
    return this.conceptosService.create(createConceptoDto);
  }

  @Get('articulos-por-cuenta/:cuentaContableId')
  async conceptosArticulosByCuenta(@Param('cuentaContableId') cuentaContableId: number) {
    return await this.conceptosService.conceptosArticulosByCuenta(cuentaContableId);
  }

  @Get('permitidos')
  async conceptosPermitidosByCuenta(
    @Query('areaId') areaId: number,
    @Query('periodo') periodo: number,
    @Query('cuentaContableId') cuentaContableId: number,
  ) {
    return await this.conceptosService.conceptosPermitidosByCuenta(
      +areaId,
      +periodo,
      +cuentaContableId,
    );
  }

  @Get('por-cuenta/:cuentaContableId')
  async findPorCuenta(@Param('cuentaContableId') cuentaContableId: number) {
    return await this.conceptosService.findPorCuenta(cuentaContableId);
  }

  @Get('totales')
  async findTotales() {
    return await this.conceptosService.findTotales();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConceptoDto: UpdateConceptoDto) {
    return this.conceptosService.update(+id, updateConceptoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptosService.remove(+id);
  }
}
