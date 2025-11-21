import { IsString, IsEnum, IsOptional, IsBoolean, Length, Matches } from 'class-validator';

export class UpdateEnteDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})?$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj?: string;

  @IsEnum(['MUNICIPIO', 'ESTADO', 'UNIAO', 'AUTARQUIA', 'FUNDACAO', 'EMPRESA_PUBLICA', 'SOCIEDADE_ECONOMIA_MISTA'])
  @IsOptional()
  tipo?: 'MUNICIPIO' | 'ESTADO' | 'UNIAO' | 'AUTARQUIA' | 'FUNDACAO' | 'EMPRESA_PUBLICA' | 'SOCIEDADE_ECONOMIA_MISTA';

  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'UF deve ter 2 caracteres' })
  uf?: string;

  @IsString()
  @IsOptional()
  entePrincipalId?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
