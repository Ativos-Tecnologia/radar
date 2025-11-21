import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

type TipoRcl = 'PREVISTO' | 'REALIZADO';

export class UpdateRclDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  percentual?: number;

  @IsOptional()
  @IsEnum(['PREVISTO', 'REALIZADO'])
  tipo?: TipoRcl;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  observacao?: string;
}
