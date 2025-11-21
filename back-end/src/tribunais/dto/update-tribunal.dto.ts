import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, Min, Max, Length } from 'class-validator';

export class UpdateTribunalDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  @Length(2, 10, { message: 'Sigla deve ter entre 2 e 10 caracteres' })
  sigla?: string;

  @IsEnum(['TJ', 'TRT', 'TRF', 'TST', 'TSE', 'STF', 'STJ'])
  @IsOptional()
  tipo?: 'TJ' | 'TRT' | 'TRF' | 'TST' | 'TSE' | 'STF' | 'STJ';

  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'UF deve ter 2 caracteres' })
  uf?: string;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Região deve ser no mínimo 1' })
  @Max(24, { message: 'Região deve ser no máximo 24' })
  regiao?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
