import { Module } from '@nestjs/common';
import { EntesService } from './entes.service';
import { EntesController } from './entes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EntesService],
  controllers: [EntesController],
  exports: [EntesService],
})
export class EntesModule {}
