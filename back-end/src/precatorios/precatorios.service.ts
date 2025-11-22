import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrecatorioDto } from './dto/create-precatorio.dto';
import { UpdatePrecatorioDto } from './dto/update-precatorio.dto';

@Injectable()
export class PrecatoriosService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePrecatorioDto) {
    await this.ensureUniqueNpu(createDto.npu, createDto.tribunalId);

    return this.prisma.precatorio.create({
      data: {
        enteId: createDto.enteId,
        tribunalId: createDto.tribunalId,
        npu: createDto.npu,
        processoOriginario: createDto.processoOriginario,
        natureza: createDto.natureza,
        fonte: createDto.fonte,
        ordemCronologica: createDto.ordemCronologica,
        anoLoa: createDto.anoLoa,
        dataLoa: this.toDate(createDto.dataLoa),
        dataTransmissao: this.toDate(createDto.dataTransmissao),
        valorAcao: createDto.valorAcao,
        advogadosDevedora: createDto.advogadosDevedora,
        advogadosCredora: createDto.advogadosCredora,
        observacoes: createDto.observacoes,
        dataAtualizacao: this.toDate(createDto.dataAtualizacao),
        precatorioEventos: {
          create: createDto.eventos?.map((evento, index) => ({
            ordem: index + 1,
            data: this.toDate(evento.data)!,
            valor: evento.valor,
            tipo: evento.tipo,
          })) || [],
        },
      },
      include: this.defaultInclude,
    });
  }

  async findAll() {
    return this.prisma.precatorio.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude,
    });
  }

  async findOne(id: string) {
    const precatorio = await this.prisma.precatorio.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    if (!precatorio) {
      throw new NotFoundException('Precatório não encontrado');
    }

    return precatorio;
  }

  async update(id: string, updateDto: UpdatePrecatorioDto) {
    const existing = await this.prisma.precatorio.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Precatório não encontrado');
    }

    if (
      (updateDto.npu && updateDto.npu !== existing.npu) ||
      (updateDto.tribunalId && updateDto.tribunalId !== existing.tribunalId)
    ) {
      await this.ensureUniqueNpu(updateDto.npu ?? existing.npu, updateDto.tribunalId ?? existing.tribunalId);
    }

    const updated = await this.prisma.precatorio.update({
      where: { id },
      data: {
        enteId: updateDto.enteId,
        tribunalId: updateDto.tribunalId,
        npu: updateDto.npu,
        processoOriginario: updateDto.processoOriginario,
        natureza: updateDto.natureza,
        fonte: updateDto.fonte,
        ordemCronologica: updateDto.ordemCronologica,
        anoLoa: updateDto.anoLoa,
        dataLoa: this.toDate(updateDto.dataLoa),
        dataTransmissao: this.toDate(updateDto.dataTransmissao),
        valorAcao: updateDto.valorAcao,
        advogadosDevedora: updateDto.advogadosDevedora,
        advogadosCredora: updateDto.advogadosCredora,
        observacoes: updateDto.observacoes,
        dataAtualizacao: this.toDate(updateDto.dataAtualizacao),
        precatorioEventos: updateDto.eventos
          ? {
              deleteMany: { precatorioId: id },
              create: updateDto.eventos.map((evento, index) => ({
                ordem: index + 1,
                data: this.toDate(evento.data)!,
                valor: evento.valor,
                tipo: evento.tipo,
              })),
            }
          : undefined,
      },
      include: this.defaultInclude,
    });

    return updated;
  }

  async remove(id: string) {
    const precatorio = await this.prisma.precatorio.findUnique({
      where: { id },
      include: { _count: { select: { pagamentos: true } } },
    });

    if (!precatorio) {
      throw new NotFoundException('Precatório não encontrado');
    }

    if (precatorio._count.pagamentos > 0) {
      throw new BadRequestException('Não é possível excluir precatórios com pagamentos vinculados');
    }
    await this.prisma.precatorio.delete({ where: { id } });

    return { message: 'Precatório removido com sucesso' };
  }

  private async ensureUniqueNpu(npu: string, tribunalId: string) {
    const duplicate = await this.prisma.precatorio.findFirst({
      where: { npu, tribunalId },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Já existe um precatório com este NPU para o tribunal selecionado');
    }
  }

  private get defaultInclude() {
    return {
      ente: true,
      tribunal: true,
      precatorioEventos: {
        orderBy: { ordem: 'asc' },
      },
    } as const;
  }

  private toDate(value?: string | null) {
    if (!value) {
      return undefined;
    }

    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    return new Date(normalized);
  }
}
