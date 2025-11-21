import { Module } from '@nestjs/common';
import { TribunaisService } from './tribunais.service';
import { TribunaisController } from './tribunais.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TribunaisService],
  controllers: [TribunaisController],
  exports: [TribunaisService],
})
export class TribunaisModule {}
