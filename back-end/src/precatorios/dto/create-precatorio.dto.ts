import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  IsNumber,
  Min,
} from 'class-validator';

export enum NaturezaCredito {
  ALIMENTAR = 'ALIMENTAR',
  COMUM = 'COMUM',
  OUTROS = 'OUTROS',
}

class PrecatorioEventoDto {
  @IsDateString()
  data: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsString()
  @MaxLength(100)
  tipo: string;
}

export class CreatePrecatorioDto {
  @IsUUID()
  enteId: string;

  @IsUUID()
  tribunalId: string;

  @IsString()
  @IsNotEmpty()
  npu: string;

  @IsOptional()
  @IsString()
  processoOriginario?: string;

  @IsEnum(NaturezaCredito)
  natureza: NaturezaCredito;

  @IsOptional()
  @IsString()
  fonte?: string;

  @IsOptional()
  @IsString()
  ordemCronologica?: string;

  @IsOptional()
  @IsInt()
  anoLoa?: number;

  @IsOptional()
  @IsDateString()
  dataLoa?: string;

  @IsOptional()
  @IsDateString()
  dataTransmissao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorAcao?: number;

  @IsOptional()
  @IsString()
  advogadosDevedora?: string;

  @IsOptional()
  @IsString()
  advogadosCredora?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsDateString()
  dataAtualizacao?: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PrecatorioEventoDto)
  eventos: PrecatorioEventoDto[];
}
