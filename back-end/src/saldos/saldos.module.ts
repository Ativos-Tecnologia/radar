import { Module } from '@nestjs/common';
import { SaldosService } from './saldos.service';
import { SaldosController } from './saldos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SaldosService],
  controllers: [SaldosController],
  exports: [SaldosService],
})
export class SaldosModule {}
