import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('aportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createAporteDto: CreateAporteDto) {
    return this.aportesService.create(createAporteDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll(@Query('enteId') enteId?: string, @Query('ano') ano?: string) {
    return this.aportesService.findAll(enteId, ano ? parseInt(ano) : undefined);
  }

  @Get('ente/:enteId')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findByEnte(@Param('enteId') enteId: string) {
    return this.aportesService.findByEnte(enteId);
  }

  @Get('anos')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  getAnosDisponiveis(@Query('enteId') enteId?: string) {
    return this.aportesService.getAnosDisponiveis(enteId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.aportesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updateAporteDto: UpdateAporteDto) {
    return this.aportesService.update(id, updateAporteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.aportesService.remove(id);
  }
}
