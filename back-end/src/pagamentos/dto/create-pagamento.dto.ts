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
import { StatusPagamento, TipoPagamento } from '@prisma/client';

export class CreatePagamentoDto {
  @IsUUID()
  precatorioId: string;

  @IsDateString()
  dataPagamento: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor: number;

  @IsEnum(TipoPagamento)
  tipo: TipoPagamento = TipoPagamento.PARCELA;

  @IsOptional()
  @IsEnum(StatusPagamento)
  status?: StatusPagamento;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  documento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
