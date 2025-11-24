import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EntesModule } from './entes/entes.module';
import { TribunaisModule } from './tribunais/tribunais.module';
import { RclModule } from './rcl/rcl.module';
import { PrecatoriosModule } from './precatorios/precatorios.module';
import { SaldosModule } from './saldos/saldos.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { AportesModule } from './aportes/aportes.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, EntesModule, TribunaisModule, RclModule, PrecatoriosModule, SaldosModule, PagamentosModule, AportesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
