import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nomeCompleto?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  senha?: string;

  @IsEnum(['ADMIN', 'OPERADOR', 'VISUALIZADOR'])
  @IsOptional()
  role?: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
