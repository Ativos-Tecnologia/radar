import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaldoDto } from './dto/create-saldo.dto';
import { UpdateSaldoDto } from './dto/update-saldo.dto';

@Injectable()
export class SaldosService {
  constructor(private prisma: PrismaService) {}

  async create(createSaldoDto: CreateSaldoDto) {
    await this.ensureUnique(createSaldoDto.enteId, createSaldoDto.competencia);

    return this.prisma.saldoConta.create({
      data: {
        enteId: createSaldoDto.enteId,
        etiqueta: createSaldoDto.etiqueta,
        regime: createSaldoDto.regime,
        contaI: createSaldoDto.contaI,
        contaII: createSaldoDto.contaII,
        competencia: new Date(createSaldoDto.competencia),
        observacoes: createSaldoDto.observacoes,
      },
      include: this.defaultInclude,
    });
  }

  async findAll() {
    return this.prisma.saldoConta.findMany({
      orderBy: { competencia: 'desc' },
      include: this.defaultInclude,
    });
  }

  async findOne(id: string) {
    const saldo = await this.prisma.saldoConta.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    if (!saldo) {
      throw new NotFoundException('Saldo não encontrado');
    }

    return saldo;
  }

  async update(id: string, updateSaldoDto: UpdateSaldoDto) {
    const saldo = await this.prisma.saldoConta.findUnique({ where: { id } });

    if (!saldo) {
      throw new NotFoundException('Saldo não encontrado');
    }

    if (
      (updateSaldoDto.enteId && updateSaldoDto.enteId !== saldo.enteId) ||
      (updateSaldoDto.competencia && new Date(updateSaldoDto.competencia).getTime() !== saldo.competencia.getTime())
    ) {
      await this.ensureUnique(updateSaldoDto.enteId ?? saldo.enteId, updateSaldoDto.competencia ?? saldo.competencia.toISOString());
    }

    return this.prisma.saldoConta.update({
      where: { id },
      data: {
        enteId: updateSaldoDto.enteId,
        etiqueta: updateSaldoDto.etiqueta,
        regime: updateSaldoDto.regime,
        contaI: updateSaldoDto.contaI,
        contaII: updateSaldoDto.contaII,
        competencia: updateSaldoDto.competencia ? new Date(updateSaldoDto.competencia) : undefined,
        observacoes: updateSaldoDto.observacoes,
      },
      include: this.defaultInclude,
    });
  }

  async remove(id: string) {
    const saldo = await this.prisma.saldoConta.findUnique({ where: { id } });

    if (!saldo) {
      throw new NotFoundException('Saldo não encontrado');
    }

    await this.prisma.saldoConta.delete({ where: { id } });

    return { message: 'Saldo removido com sucesso' };
  }

  private async ensureUnique(enteId: string, competencia: string | Date) {
    const competenciaDate = new Date(competencia);
    const duplicate = await this.prisma.saldoConta.findFirst({
      where: {
        enteId,
        competencia: competenciaDate,
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Já existe um saldo cadastrado para este ente nessa competência');
    }
  }

  private get defaultInclude() {
    return {
      ente: true,
    } as const;
  }
}
