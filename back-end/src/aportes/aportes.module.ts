import { Module } from '@nestjs/common';
import { AportesService } from './aportes.service';
import { AportesController } from './aportes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AportesController],
  providers: [AportesService],
  exports: [AportesService],
})
export class AportesModule {}
