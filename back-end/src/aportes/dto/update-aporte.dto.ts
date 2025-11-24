import { PartialType } from '@nestjs/mapped-types';
import { MesAporteDto } from './create-aporte.dto';

export class UpdateAporteDto extends PartialType(MesAporteDto) {}
