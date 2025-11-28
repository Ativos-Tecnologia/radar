import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum RegimeSaldoDto {
  ESPECIAL = 'ESPECIAL',
  COMUM = 'COMUM',
}

export class CreateSaldoDto {
  @IsUUID()
  enteId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  etiqueta?: string;

  @IsEnum(RegimeSaldoDto)
  regime: RegimeSaldoDto;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  contaI: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  contaII: number;

  @IsDateString()
  competencia: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
