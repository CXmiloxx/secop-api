import { Controller, Post, Body } from '@nestjs/common';
import { PartidaNoPresupuestadaService } from './partida-no-presupuestada.service';
import { CreatePartidaNoPresupuestadaDto } from './dto/create-partida-no-presupuestada.dto';

@Controller('partida-no-presupuestada')
export class PartidaNoPresupuestadaController {
  constructor(private readonly partidaNoPresupuestadaService: PartidaNoPresupuestadaService) {}

  @Post()
  create(@Body() createPartidaNoPresupuestadaDto: CreatePartidaNoPresupuestadaDto) {
    return this.partidaNoPresupuestadaService.create(createPartidaNoPresupuestadaDto);
  }
}
