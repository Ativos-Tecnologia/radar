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
import { TribunaisService } from './tribunais.service';
import { CreateTribunalDto } from './dto/create-tribunal.dto';
import { UpdateTribunalDto } from './dto/update-tribunal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tribunais')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TribunaisController {
  constructor(private readonly tribunaisService: TribunaisService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createTribunalDto: CreateTribunalDto) {
    return this.tribunaisService.create(createTribunalDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll() {
    return this.tribunaisService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.tribunaisService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updateTribunalDto: UpdateTribunalDto) {
    return this.tribunaisService.update(id, updateTribunalDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.tribunaisService.remove(id);
  }
}
