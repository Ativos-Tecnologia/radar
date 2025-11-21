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
import { RclService } from './rcl.service';
import { CreateRclDto } from './dto/create-rcl.dto';
import { UpdateRclDto } from './dto/update-rcl.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rcl')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RclController {
  constructor(private readonly rclService: RclService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createRclDto: CreateRclDto) {
    return this.rclService.create(createRclDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll() {
    return this.rclService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.rclService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updateRclDto: UpdateRclDto) {
    return this.rclService.update(id, updateRclDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.rclService.remove(id);
  }
}
