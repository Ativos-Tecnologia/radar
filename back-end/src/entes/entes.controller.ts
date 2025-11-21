import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EntesService } from './entes.service';
import { CreateEnteDto } from './dto/create-ente.dto';
import { UpdateEnteDto } from './dto/update-ente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('entes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntesController {
  constructor(private readonly entesService: EntesService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createEnteDto: CreateEnteDto) {
    return this.entesService.create(createEnteDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll() {
    return this.entesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.entesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updateEnteDto: UpdateEnteDto) {
    return this.entesService.update(id, updateEnteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.entesService.remove(id);
  }
}
