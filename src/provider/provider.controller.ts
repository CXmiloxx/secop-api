import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  async create(@Body() createProviderDto: CreateProviderDto) {
    return await this.providerService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerService.remove(+id);
  }
}
