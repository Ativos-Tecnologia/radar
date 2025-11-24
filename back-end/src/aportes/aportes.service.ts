import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';

@Injectable()
export class AportesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAporteDto) {
    // Verificar se o ente existe
    const ente = await this.prisma.ente.findUnique({
      where: { id: createDto.enteId },
    });

    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    // Criar aportes para cada mês
    const aportes: any[] = [];
    for (const mesData of createDto.meses) {
      // Verificar se já existe aporte para este ente/ano/mês
      const existing = await this.prisma.aporte.findUnique({
        where: {
          enteId_ano_mes: {
            enteId: createDto.enteId,
            ano: createDto.ano,
            mes: mesData.mes,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe aporte cadastrado para ${ente.nome} em ${this.getMesNome(mesData.mes)}/${createDto.ano}`,
        );
      }

      const aporte = await this.prisma.aporte.create({
        data: {
          enteId: createDto.enteId,
          ano: createDto.ano,
          mes: mesData.mes,
          conta1: mesData.conta1 ?? 0,
          conta2: mesData.conta2 ?? 0,
          valorRepassado: mesData.valorRepassado ?? 0,
          valorDisponibilizado: mesData.valorDisponibilizado ?? 0,
        },
        include: {
          ente: true,
        },
      });

      aportes.push(aporte);
    }

    return aportes;
  }

  async findAll(enteId?: string, ano?: number) {
    const where: any = {};

    if (enteId) {
      where.enteId = enteId;
    }

    if (ano) {
      where.ano = ano;
    }

    return this.prisma.aporte.findMany({
      where,
      include: {
        ente: {
          include: {
            entePrincipal: true,
            entesVinculados: true,
          },
        },
      },
      orderBy: [{ ano: 'desc' }, { mes: 'asc' }],
    });
  }

  async findByEnte(enteId: string) {
    const ente = await this.prisma.ente.findUnique({
      where: { id: enteId },
      include: {
        entesVinculados: true,
      },
    });

    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    // Buscar aportes do ente principal
    const aportesPrincipal = await this.prisma.aporte.findMany({
      where: { enteId },
      include: { ente: true },
      orderBy: [{ ano: 'desc' }, { mes: 'asc' }],
    });

    // Buscar aportes dos entes filhos
    const aportesFilhos: any[] = [];
    for (const filho of ente.entesVinculados) {
      const aportes = await this.prisma.aporte.findMany({
        where: { enteId: filho.id },
        include: { ente: true },
        orderBy: [{ ano: 'desc' }, { mes: 'asc' }],
      });
      aportesFilhos.push(...aportes);
    }

    return {
      ente,
      aportesPrincipal,
      aportesFilhos,
    };
  }

  async findOne(id: string) {
    const aporte = await this.prisma.aporte.findUnique({
      where: { id },
      include: {
        ente: {
          include: {
            entePrincipal: true,
            entesVinculados: true,
          },
        },
      },
    });

    if (!aporte) {
      throw new NotFoundException('Aporte não encontrado');
    }

    return aporte;
  }

  async update(id: string, updateDto: UpdateAporteDto) {
    const aporte = await this.prisma.aporte.findUnique({
      where: { id },
    });

    if (!aporte) {
      throw new NotFoundException('Aporte não encontrado');
    }

    return this.prisma.aporte.update({
      where: { id },
      data: {
        conta1: updateDto.conta1,
        conta2: updateDto.conta2,
        valorRepassado: updateDto.valorRepassado,
        valorDisponibilizado: updateDto.valorDisponibilizado,
      },
      include: {
        ente: true,
      },
    });
  }

  async remove(id: string) {
    const aporte = await this.prisma.aporte.findUnique({
      where: { id },
    });

    if (!aporte) {
      throw new NotFoundException('Aporte não encontrado');
    }

    await this.prisma.aporte.delete({
      where: { id },
    });

    return { message: 'Aporte removido com sucesso' };
  }

  async getAnosDisponiveis(enteId?: string) {
    const where: any = {};
    if (enteId) {
      where.enteId = enteId;
    }

    const aportes = await this.prisma.aporte.findMany({
      where,
      select: { ano: true },
      distinct: ['ano'],
      orderBy: { ano: 'desc' },
    });

    return aportes.map((a) => a.ano);
  }

  private getMesNome(mes: number): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return meses[mes - 1] || 'Mês inválido';
  }
}
