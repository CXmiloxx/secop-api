import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PresupuestoGeneralService } from './presupuesto-general.service';
import { CreatePresupuestoGeneralDto } from './dto/create-presupuesto-general.dto';
import { UpdatePresupuestoGeneralDto } from './dto/update-presupuesto-general.dto';

@Controller('presupuesto-general')
export class PresupuestoGeneralController {
  constructor(private readonly presupuestoGeneralService: PresupuestoGeneralService) {}

  @Post()
  create(@Body() createPresupuestoGeneralDto: CreatePresupuestoGeneralDto) {
    return this.presupuestoGeneralService.create(createPresupuestoGeneralDto);
  }

  @Get()
  async findAll(@Query('periodo') periodo: number) {
    return await this.presupuestoGeneralService.findAll(periodo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presupuestoGeneralService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePresupuestoGeneralDto: UpdatePresupuestoGeneralDto,
  ) {
    return this.presupuestoGeneralService.update(+id, updatePresupuestoGeneralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.presupuestoGeneralService.remove(+id);
  }
}
