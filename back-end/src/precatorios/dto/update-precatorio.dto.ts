import { PartialType } from '@nestjs/mapped-types';
import { CreatePrecatorioDto } from './create-precatorio.dto';

export class UpdatePrecatorioDto extends PartialType(CreatePrecatorioDto) {}
