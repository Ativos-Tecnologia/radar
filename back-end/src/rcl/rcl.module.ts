import { Module } from '@nestjs/common';
import { RclService } from './rcl.service';
import { RclController } from './rcl.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RclService],
  controllers: [RclController],
})
export class RclModule {}
