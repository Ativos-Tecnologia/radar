import { Module } from '@nestjs/common';
import { PrecatoriosService } from './precatorios.service';
import { PrecatoriosController } from './precatorios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrecatoriosImportService } from './precatorios-import.service';
import { PrecatoriosImportGateway } from './precatorios-import.gateway';

@Module({
  imports: [PrismaModule],
  providers: [PrecatoriosService, PrecatoriosImportService, PrecatoriosImportGateway],
  controllers: [PrecatoriosController],
  exports: [PrecatoriosService],
})
export class PrecatoriosModule {}
