import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTribunalDto } from './dto/create-tribunal.dto';
import { UpdateTribunalDto } from './dto/update-tribunal.dto';

@Injectable()
export class TribunaisService {
  constructor(private prisma: PrismaService) {}

  async create(createTribunalDto: CreateTribunalDto) {
    // Verificar se sigla já existe
    const existingTribunal = await this.prisma.tribunal.findUnique({
      where: { sigla: createTribunalDto.sigla },
    });

    if (existingTribunal) {
      throw new ConflictException('Sigla já cadastrada');
    }

    // Validar região obrigatória para TRT e TRF
    if ((createTribunalDto.tipo === 'TRT' || createTribunalDto.tipo === 'TRF') && !createTribunalDto.regiao) {
      throw new ConflictException(`Região é obrigatória para ${createTribunalDto.tipo}`);
    }

    return this.prisma.tribunal.create({
      data: createTribunalDto,
    });
  }

  async findAll() {
    return this.prisma.tribunal.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const tribunal = await this.prisma.tribunal.findUnique({
      where: { id },
    });

    if (!tribunal) {
      throw new NotFoundException('Tribunal não encontrado');
    }

    return tribunal;
  }

  async update(id: string, updateTribunalDto: UpdateTribunalDto) {
    const tribunal = await this.prisma.tribunal.findUnique({
      where: { id },
    });

    if (!tribunal) {
      throw new NotFoundException('Tribunal não encontrado');
    }

    // Verificar se sigla já existe (se estiver sendo alterada)
    if (updateTribunalDto.sigla && updateTribunalDto.sigla !== tribunal.sigla) {
      const existingTribunal = await this.prisma.tribunal.findUnique({
        where: { sigla: updateTribunalDto.sigla },
      });

      if (existingTribunal) {
        throw new ConflictException('Sigla já cadastrada');
      }
    }

    // Validar região obrigatória para TRT e TRF
    const tipoFinal = updateTribunalDto.tipo || tribunal.tipo;
    const regiaoFinal = updateTribunalDto.regiao !== undefined ? updateTribunalDto.regiao : tribunal.regiao;
    
    if ((tipoFinal === 'TRT' || tipoFinal === 'TRF') && !regiaoFinal) {
      throw new ConflictException(`Região é obrigatória para ${tipoFinal}`);
    }

    // Construir objeto apenas com campos definidos
    const dataToUpdate: any = {};

    if (updateTribunalDto.nome !== undefined) dataToUpdate.nome = updateTribunalDto.nome;
    if (updateTribunalDto.sigla !== undefined) dataToUpdate.sigla = updateTribunalDto.sigla;
    if (updateTribunalDto.tipo !== undefined) dataToUpdate.tipo = updateTribunalDto.tipo;
    if (updateTribunalDto.uf !== undefined) dataToUpdate.uf = updateTribunalDto.uf;
    if (updateTribunalDto.regiao !== undefined) dataToUpdate.regiao = updateTribunalDto.regiao;
    if (updateTribunalDto.observacoes !== undefined) dataToUpdate.observacoes = updateTribunalDto.observacoes;
    if (updateTribunalDto.ativo !== undefined) dataToUpdate.ativo = updateTribunalDto.ativo;

    return this.prisma.tribunal.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    const tribunal = await this.prisma.tribunal.findUnique({
      where: { id },
    });

    if (!tribunal) {
      throw new NotFoundException('Tribunal não encontrado');
    }

    await this.prisma.tribunal.delete({
      where: { id },
    });

    return { message: 'Tribunal removido com sucesso' };
  }
}
