import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(createUserDto.senha, 10);

    const user = await this.prisma.user.create({
      data: {
        nomeCompleto: createUserDto.nomeCompleto,
        email: createUserDto.email,
        departamento: createUserDto.departamento,
        senhaHash,
        role: createUserDto.role,
        fotoUrl: createUserDto.fotoUrl,
        ativo: createUserDto.ativo ?? true,
      },
    });

    const { senhaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(({ senhaHash, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { senhaHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Construir objeto apenas com campos definidos
    const dataToUpdate: any = {};

    if (updateUserDto.nomeCompleto !== undefined) {
      dataToUpdate.nomeCompleto = updateUserDto.nomeCompleto;
    }
    if (updateUserDto.email !== undefined) {
      dataToUpdate.email = updateUserDto.email;
    }
    if (updateUserDto.departamento !== undefined) {
      dataToUpdate.departamento = updateUserDto.departamento;
    }
    if (updateUserDto.role !== undefined) {
      dataToUpdate.role = updateUserDto.role;
    }
    if (updateUserDto.fotoUrl !== undefined) {
      dataToUpdate.fotoUrl = updateUserDto.fotoUrl;
    }
    if (updateUserDto.ativo !== undefined) {
      dataToUpdate.ativo = updateUserDto.ativo;
    }
    if (updateUserDto.senha) {
      dataToUpdate.senhaHash = await bcrypt.hash(updateUserDto.senha, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { senhaHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.senhaAtual,
      user.senhaHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(changePasswordDto.novaSenha, 10);

    // Atualizar senha
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { senhaHash: novaSenhaHash },
    });

    const { senhaHash, ...userWithoutPassword } = updatedUser;
    return { message: 'Senha alterada com sucesso', user: userWithoutPassword };
  }
}
