import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PrecatoriosService } from './precatorios.service';
import { PrecatoriosImportService } from './precatorios-import.service';
import { CreatePrecatorioDto } from './dto/create-precatorio.dto';
import { UpdatePrecatorioDto } from './dto/update-precatorio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('precatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrecatoriosController {
  constructor(
    private readonly precatoriosService: PrecatoriosService,
    private readonly precatoriosImportService: PrecatoriosImportService,
  ) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() createPrecatorioDto: CreatePrecatorioDto) {
    return this.precatoriosService.create(createPrecatorioDto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findAll() {
    return this.precatoriosService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR', 'VISUALIZADOR')
  findOne(@Param('id') id: string) {
    return this.precatoriosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() updatePrecatorioDto: UpdatePrecatorioDto) {
    return this.precatoriosService.update(id, updatePrecatorioDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.precatoriosService.remove(id);
  }

  @Post('import')
  @Roles('ADMIN', 'OPERADOR')
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientId') clientId?: string,
  ) {
    return this.precatoriosImportService.importFromExcel(file, clientId);
  }

  @Get('import/template')
  @Roles('ADMIN', 'OPERADOR')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.precatoriosImportService.generateTemplate();
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-precatorios.xlsx"',
    });
    res.send(buffer);
  }
}
