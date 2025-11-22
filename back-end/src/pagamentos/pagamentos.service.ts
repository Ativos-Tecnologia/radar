import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagamentoDto: CreatePagamentoDto) {
    await this.ensurePrecatorioExists(createPagamentoDto.precatorioId);

    return this.prisma.pagamento.create({
      data: {
        precatorioId: createPagamentoDto.precatorioId,
        dataPagamento: new Date(createPagamentoDto.dataPagamento),
        valor: createPagamentoDto.valor,
        tipo: createPagamentoDto.tipo,
        status: createPagamentoDto.status,
        documento: createPagamentoDto.documento,
        observacoes: createPagamentoDto.observacoes,
      },
      include: this.defaultInclude,
    });
  }

  async findAll() {
    return this.prisma.pagamento.findMany({
      orderBy: { dataPagamento: 'desc' },
      include: this.defaultInclude,
    });
  }

  async findOne(id: string) {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return pagamento;
  }

  async update(id: string, updatePagamentoDto: UpdatePagamentoDto) {
    await this.findOne(id);

    if (updatePagamentoDto.precatorioId) {
      await this.ensurePrecatorioExists(updatePagamentoDto.precatorioId);
    }

    return this.prisma.pagamento.update({
      where: { id },
      data: {
        precatorioId: updatePagamentoDto.precatorioId,
        dataPagamento: updatePagamentoDto.dataPagamento ? new Date(updatePagamentoDto.dataPagamento) : undefined,
        valor: updatePagamentoDto.valor,
        tipo: updatePagamentoDto.tipo,
        status: updatePagamentoDto.status,
        documento: updatePagamentoDto.documento,
        observacoes: updatePagamentoDto.observacoes,
      },
      include: this.defaultInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.pagamento.delete({ where: { id } });

    return { message: 'Pagamento removido com sucesso' };
  }

  private async ensurePrecatorioExists(precatorioId: string) {
    const exists = await this.prisma.precatorio.findUnique({ where: { id: precatorioId }, select: { id: true } });

    if (!exists) {
      throw new NotFoundException('Precatório não encontrado');
    }
  }

  private get defaultInclude() {
    return {
      precatorio: {
        select: {
          id: true,
          npu: true,
          ente: { select: { id: true, nome: true } },
          tribunal: { select: { id: true, nome: true } },
        },
      },
    } as const;
  }
}
