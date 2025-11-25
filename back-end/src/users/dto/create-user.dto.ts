import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;

  @IsEnum(['ADMIN', 'OPERADOR', 'VISUALIZADOR'])
  @IsNotEmpty()
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
