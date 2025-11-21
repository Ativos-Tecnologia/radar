import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, user.senhaHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      departamento: user.departamento,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        role: user.role,
        departamento: user.departamento,
        fotoUrl: user.fotoUrl,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.ativo) {
      return null;
    }

    return {
      id: user.id,
      nomeCompleto: user.nomeCompleto,
      email: user.email,
      role: user.role,
      departamento: user.departamento,
      fotoUrl: user.fotoUrl,
    };
  }
}
