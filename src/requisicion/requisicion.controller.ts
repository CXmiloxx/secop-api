import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RequisicionService } from './requisicion.service';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { UpdateRequisicionDto } from './dto/update-requisicion.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisicionService.findOne(+id);
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
