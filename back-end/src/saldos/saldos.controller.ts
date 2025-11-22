import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SaldosService } from './saldos.service';
import { CreateSaldoDto } from './dto/create-saldo.dto';
import { UpdateSaldoDto } from './dto/update-saldo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('saldos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaldosController {
  constructor(private readonly saldosService: SaldosService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createSaldoDto: CreateSaldoDto) {
    return this.saldosService.create(createSaldoDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll() {
    return this.saldosService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.saldosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updateSaldoDto: UpdateSaldoDto) {
    return this.saldosService.update(id, updateSaldoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.saldosService.remove(id);
  }
}
