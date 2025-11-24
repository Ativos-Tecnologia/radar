import { IsString, IsInt, Min, Max, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MesAporteDto {
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  conta1?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  conta2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorRepassado?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorDisponibilizado?: number;
}

export class CreateAporteDto {
  @IsString()
  enteId: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  ano: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MesAporteDto)
  meses: MesAporteDto[];
}
