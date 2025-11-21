import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

type TipoRcl = 'PREVISTO' | 'REALIZADO';

export class CreateRclDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  percentual: number;

  @IsEnum(['PREVISTO', 'REALIZADO'])
  tipo: TipoRcl;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsString()
  enteId: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
