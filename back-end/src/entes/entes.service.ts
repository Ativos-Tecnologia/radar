import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnteDto } from './dto/create-ente.dto';
import { UpdateEnteDto } from './dto/update-ente.dto';

@Injectable()
export class EntesService {
  constructor(private prisma: PrismaService) {}

  async create(createEnteDto: CreateEnteDto) {
    // Verificar se CNPJ já existe (apenas se fornecido)
    if (createEnteDto.cnpj) {
      const existingEnte = await this.prisma.ente.findUnique({
        where: { cnpj: createEnteDto.cnpj },
      });

      if (existingEnte) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Verificar se ente principal existe (se fornecido)
    if (createEnteDto.entePrincipalId) {
      const entePrincipal = await this.prisma.ente.findUnique({
        where: { id: createEnteDto.entePrincipalId },
      });

      if (!entePrincipal) {
        throw new NotFoundException('Ente principal não encontrado');
      }
    }

    return this.prisma.ente.create({
      data: createEnteDto,
      include: {
        entePrincipal: true,
      },
    });
  }

  async findAll() {
    return this.prisma.ente.findMany({
      include: {
        entePrincipal: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        entesVinculados: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const ente = await this.prisma.ente.findUnique({
      where: { id },
      include: {
        entePrincipal: true,
        entesVinculados: true,
      },
    });

    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    return ente;
  }

  async update(id: string, updateEnteDto: UpdateEnteDto) {
    const ente = await this.prisma.ente.findUnique({
      where: { id },
    });

    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado e fornecido)
    if (updateEnteDto.cnpj !== undefined && updateEnteDto.cnpj !== ente.cnpj) {
      if (updateEnteDto.cnpj) {
        const existingEnte = await this.prisma.ente.findUnique({
          where: { cnpj: updateEnteDto.cnpj },
        });

        if (existingEnte) {
          throw new ConflictException('CNPJ já cadastrado');
        }
      }
    }

    // Verificar se ente principal existe (se fornecido)
    if (updateEnteDto.entePrincipalId) {
      const entePrincipal = await this.prisma.ente.findUnique({
        where: { id: updateEnteDto.entePrincipalId },
      });

      if (!entePrincipal) {
        throw new NotFoundException('Ente principal não encontrado');
      }
    }

    // Construir objeto apenas com campos definidos
    const dataToUpdate: any = {};

    if (updateEnteDto.nome !== undefined) dataToUpdate.nome = updateEnteDto.nome;
    if (updateEnteDto.cnpj !== undefined) dataToUpdate.cnpj = updateEnteDto.cnpj;
    if (updateEnteDto.tipo !== undefined) dataToUpdate.tipo = updateEnteDto.tipo;
    if (updateEnteDto.uf !== undefined) dataToUpdate.uf = updateEnteDto.uf;
    if (updateEnteDto.regime !== undefined) dataToUpdate.regime = updateEnteDto.regime;
    if (updateEnteDto.entePrincipalId !== undefined) dataToUpdate.entePrincipalId = updateEnteDto.entePrincipalId;
    if (updateEnteDto.observacoes !== undefined) dataToUpdate.observacoes = updateEnteDto.observacoes;
    if (updateEnteDto.ativo !== undefined) dataToUpdate.ativo = updateEnteDto.ativo;

    return this.prisma.ente.update({
      where: { id },
      data: dataToUpdate,
      include: {
        entePrincipal: true,
        entesVinculados: true,
      },
    });
  }

  async remove(id: string) {
    const ente = await this.prisma.ente.findUnique({
      where: { id },
      include: {
        entesVinculados: true,
      },
    });

    if (!ente) {
      throw new NotFoundException('Ente não encontrado');
    }

    // Verificar se há entes vinculados
    if (ente.entesVinculados.length > 0) {
      throw new ConflictException(
        'Não é possível excluir um ente com entes vinculados. Desvincule-os primeiro.',
      );
    }

    await this.prisma.ente.delete({
      where: { id },
    });

    return { message: 'Ente removido com sucesso' };
  }
}
