import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRclDto } from './dto/create-rcl.dto';
import { UpdateRclDto } from './dto/update-rcl.dto';

@Injectable()
export class RclService {
  constructor(private prisma: PrismaService) {}

  async create(createRclDto: CreateRclDto) {
    const ente = await this.prisma.ente.findUnique({ where: { id: createRclDto.enteId } });
    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    const existing = await this.prisma.rcl.findUnique({
      where: {
        enteId_ano_tipo: {
          enteId: createRclDto.enteId,
          ano: createRclDto.ano,
          tipo: createRclDto.tipo,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um registro para este ente/ano/tipo');
    }

    return this.prisma.rcl.create({
      data: createRclDto,
      include: { ente: true },
    });
  }

  async findAll() {
    return this.prisma.rcl.findMany({
      orderBy: { ano: 'desc' },
      include: { ente: true },
    });
  }

  async findOne(id: string) {
    const rcl = await this.prisma.rcl.findUnique({
      where: { id },
      include: { ente: true },
    });

    if (!rcl) {
      throw new NotFoundException('RCL não encontrado');
    }

    return rcl;
  }

  async update(id: string, updateRclDto: UpdateRclDto) {
    const rcl = await this.prisma.rcl.findUnique({ where: { id } });

    if (!rcl) {
      throw new NotFoundException('RCL não encontrado');
    }

    const anoFinal = updateRclDto.ano ?? rcl.ano;
    const tipoFinal = updateRclDto.tipo ?? rcl.tipo;

    if (anoFinal !== rcl.ano || tipoFinal !== rcl.tipo) {
      const existing = await this.prisma.rcl.findUnique({
        where: {
          enteId_ano_tipo: {
            enteId: rcl.enteId,
            ano: anoFinal,
            tipo: tipoFinal,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um registro para este ente/ano/tipo');
      }
    }

    const dataToUpdate: any = {};
    if (updateRclDto.ano !== undefined) dataToUpdate.ano = updateRclDto.ano;
    if (updateRclDto.valor !== undefined) dataToUpdate.valor = updateRclDto.valor;
    if (updateRclDto.percentual !== undefined) dataToUpdate.percentual = updateRclDto.percentual;
    if (updateRclDto.tipo !== undefined) dataToUpdate.tipo = updateRclDto.tipo;
    if (updateRclDto.observacao !== undefined) dataToUpdate.observacao = updateRclDto.observacao;
    if (updateRclDto.ativo !== undefined) dataToUpdate.ativo = updateRclDto.ativo;

    return this.prisma.rcl.update({
      where: { id },
      data: dataToUpdate,
      include: { ente: true },
    });
  }

  async remove(id: string) {
    const rcl = await this.prisma.rcl.findUnique({ where: { id } });
    if (!rcl) {
      throw new NotFoundException('RCL não encontrado');
    }

    await this.prisma.rcl.delete({ where: { id } });
    return { message: 'Registro removido com sucesso' };
  }
}
