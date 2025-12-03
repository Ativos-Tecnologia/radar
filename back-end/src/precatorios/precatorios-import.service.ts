import { BadRequestException, Injectable } from '@nestjs/common';
import { Express } from 'express';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { PrecatoriosService } from './precatorios.service';
import {
  PrecatoriosImportGateway,
  ImportProgress,
  ImportResult,
} from './precatorios-import.gateway';
import { CreatePrecatorioDto, NaturezaCredito } from './dto/create-precatorio.dto';

interface NormalizedRow {
  [key: string]: any;
}

@Injectable()
export class PrecatoriosImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly precatoriosService: PrecatoriosService,
    private readonly gateway: PrecatoriosImportGateway,
  ) { }

  async importFromExcel(file: Express.Multer.File, clientId?: string) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: false,
      raw: true,
      dateNF: 'dd/mm/yyyy',
    });

    if (!workbook.SheetNames.length) {
      throw new BadRequestException('Planilha vazia');
    }

    const sheetName =
      workbook.SheetNames.find((name) => name.toLowerCase() !== 'instruções') ||
      workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      raw: true,
      defval: null,
    });

    const result: ImportResult = {
      total: rows.length,
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      updatedItems: [],
    };

    if (!rows.length) {
      this.gateway.sendComplete(clientId ?? null, result);
      return result;
    }

    const processedMap = new Map<string, number>();

    for (let index = 0; index < rows.length; index++) {
      const rowNumber = index + 2; // +2 por causa do header
      const rawRow = rows[index];
      const normalizedRow = this.normalizeRow(rawRow);

      try {
        const dto = await this.buildDtoFromRow(normalizedRow, rowNumber);
        const existing = await this.prisma.precatorio.findFirst({
          where: {
            tribunalId: dto.tribunalId,
            npu: dto.npu,
            enteId: dto.enteId
          },
          include: { precatorioEventos: true },
        });

        // Verificar duplicidade no próprio arquivo
        const uniqueKey = `${dto.npu}-${dto.enteId}-${dto.tribunalId}`;
        if (processedMap.has(uniqueKey)) {
          const originalRow = processedMap.get(uniqueKey);
          throw new Error(`Linha duplicada no arquivo (NPU já processado na linha ${originalRow})`);
        }
        processedMap.set(uniqueKey, rowNumber);

        console.log(`🔍 Processando linha ${index + 1} - Existing: ${existing ? 'SIM' : 'NÃO'}`);

        if (existing) {
          // Atualizar apenas campos que mudaram
          const { diff: updateData, changes: fieldChanges } = this.buildSelectiveUpdate(dto, existing);
          const eventChanges = this.getEventChanges(dto.eventos, existing.precatorioEventos);

          console.log(`🔍 LINHA ${rowNumber}: updateData tem ${Object.keys(updateData).length} campos, eventos: ${eventChanges.length}`);

          if (Object.keys(updateData).length > 0 || eventChanges.length > 0) {
            // Construir DTO parcial apenas com campos que mudaram
            const partialDto: any = { ...updateData };

            // Juntar todas as mudanças para o relatório
            const allChanges = [...fieldChanges, ...eventChanges];

            if (eventChanges.length > 0) {
              partialDto.eventos = dto.eventos;
            }

            await this.precatoriosService.update(existing.id, partialDto);
            result.updated++;

            // Adicionar informações sobre o item atualizado
            result.updatedItems.push({
              row: rowNumber,
              npu: dto.npu,
              ente: normalizedRow['ente_nome'] || dto.enteId,
              changes: allChanges,
            });
          } else {
            // Nenhuma mudança detectada
            result.skipped++;
          }
        } else {
          await this.precatoriosService.create(dto);
          result.created++;
        }

        result.success++;

        const progress: ImportProgress = {
          total: result.total,
          current: index + 1,
          percentage: Math.round(((index + 1) / result.total) * 100),
          status: `Processando linha ${rowNumber}`,
          currentRow: rowNumber,
          preview: {
            npu: dto.npu,
            ente: normalizedRow['ente_nome'] || dto.enteId,
          },
        };
        this.gateway.sendProgress(clientId ?? null, progress);
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          error: error?.message || 'Erro desconhecido',
          data: rawRow,
        });
      }
    }

    this.gateway.sendComplete(clientId ?? null, result);
    return result;
  }

  async generateTemplate() {
    const headers = [
      'ente_id',
      'ente_nome',
      'tribunal_id',
      'tribunal_sigla',
      'npu',
      'processo_originario',
      'natureza',
      'fonte',
      'ordem_cronologica',
      'ano_loa',
      'data_loa',
      'data_transmissao',
      'valor_acao',
      'valor_aberto',
      'super_preferencia',
      'advogados_devedora',
      'advogados_credora',
      'observacoes',
      'data_atualizacao',
    ];

    for (let i = 1; i <= 100; i++) {
      headers.push(`evento${i}_data`, `evento${i}_valor`, `evento${i}_tipo`);
    }

    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet([], { header: headers });
    XLSX.utils.sheet_add_aoa(dataSheet, [headers], { origin: 'A1' });

    const sampleRow: Record<string, string> = {
      ente_id: 'ID do ente',
      ente_nome: 'Nome do ente (referência)',
      tribunal_id: 'ID do tribunal',
      tribunal_sigla: 'TRF1',
      npu: '0000000-00.0000.0.00.0000',
      processo_originario: 'Processo original',
      natureza: 'ALIMENTAR/COMUM/OUTROS',
      fonte: 'Fonte do recurso',
      ordem_cronologica: '123/2024',
      ano_loa: '2024',
      data_loa: '10/10/2024',
      data_transmissao: '15/10/2024',
      valor_acao: '100000,00',
      valor_aberto: '80000,00',
      super_preferencia: 'Há registros de credores em condição de superpreferência neste precatório',
      advogados_devedora: 'Nome da defesa',
      advogados_credora: 'Nome do advogado',
      observacoes: 'Qualquer observação',
      data_atualizacao: '01/10/2024 12:00',
    };

    sampleRow['evento1_data'] = '10/10/2024';
    sampleRow['evento1_valor'] = '50000,00';
    sampleRow['evento1_tipo'] = 'Preferência';
    sampleRow['evento2_data'] = '15/11/2024';
    sampleRow['evento2_valor'] = '20000,00';
    sampleRow['evento2_tipo'] = 'Cronológica';

    XLSX.utils.sheet_add_json(dataSheet, [sampleRow], {
      origin: 'A2',
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Dados');

    const instructions = [
      ['Instruções'],
      ['- Utilize os IDs exibidos na tela para ente_id e tribunal_id.'],
      ['- Datas devem estar no formato DD/MM/AAAA (ou DD/MM/AAAA HH:MM).'],
      ['- Valores aceitam separador decimal vírgula (ex: 1000,50).'],
      ['- Natureza aceita apenas ALIMENTAR, COMUM ou OUTROS.'],
      ['- O arquivo suporta até 100 eventos (evento1_data/valor/tipo até evento100_*).'],
      ['- Para linhas sem eventos adicionais, deixe as colunas em branco.'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'INSTRUÇÕES');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private async buildDtoFromRow(row: NormalizedRow, rowNumber: number): Promise<CreatePrecatorioDto> {
    const enteId = this.getRequiredString(row, 'ente_id', rowNumber);
    const tribunalId = this.getRequiredString(row, 'tribunal_id', rowNumber);
    const npu = this.getRequiredString(row, 'npu', rowNumber);

    await this.ensureEnteExists(enteId, rowNumber);
    await this.ensureTribunalExists(tribunalId, rowNumber);

    const dto: CreatePrecatorioDto = {
      enteId,
      tribunalId,
      npu,
      processoOriginario: this.getString(row, 'processo_originario', rowNumber),
      natureza: this.parseNatureza(row['natureza'], rowNumber),
      fonte: this.getString(row, 'fonte', rowNumber),
      ordemCronologica: this.getString(row, 'ordem_cronologica', rowNumber),
      anoLoa: this.parseInteger(row['ano_loa'], 'ano_loa', rowNumber),
      dataLoa: this.parseDate(row['data_loa'], 'data_loa', rowNumber),
      dataTransmissao: this.parseDate(row['data_transmissao'], 'data_transmissao', rowNumber),
      valorAcao: this.parseDecimal(row['valor_acao'], 'valor_acao', rowNumber),
      valorAberto: this.parseDecimal(row['valor_aberto'], 'valor_aberto', rowNumber),
      superPreferencia: this.parseBoolean(row['super_preferencia'], 'super_preferencia', rowNumber),
      advogadosDevedora: this.getString(row, 'advogados_devedora', rowNumber),
      advogadosCredora: this.getString(row, 'advogados_credora', rowNumber),
      observacoes: this.getString(row, 'observacoes', rowNumber),
      dataAtualizacao: this.parseDate(row['data_atualizacao'], 'data_atualizacao', rowNumber, {
        allowTime: true,
      }),
      eventos: this.parseEventos(row, rowNumber),
    };

    return dto;
  }

  private normalizeRow(row: Record<string, any>): NormalizedRow {
    const normalized: NormalizedRow = {};
    Object.entries(row).forEach(([key, value]) => {
      if (!key) return;
      const normalizedKey = key
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '_')
        .trim();
      normalized[normalizedKey] = value;
    });
    return normalized;
  }

  private getRequiredString(row: NormalizedRow, key: string, rowNumber: number) {
    const value = this.getString(row, key, rowNumber);
    if (value === undefined) {
      throw new Error(`Linha ${rowNumber}: campo "${key}" é obrigatório`);
    }
    return value;
  }

  private getString(row: NormalizedRow, key: string, rowNumber: number) {
    const value = row[key];
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return String(value).trim();
  }

  private parseNatureza(value: any, rowNumber: number): NaturezaCredito {
    if (!value) {
      throw new Error(`Linha ${rowNumber}: campo "natureza" é obrigatório`);
    }
    const normalized = String(value).trim().toUpperCase();
    if (!['ALIMENTAR', 'COMUM', 'OUTROS'].includes(normalized)) {
      throw new Error(
        `Linha ${rowNumber}: natureza inválida. Use ALIMENTAR, COMUM ou OUTROS`,
      );
    }
    return normalized as NaturezaCredito;
  }

  private parseInteger(value: any, field: string, rowNumber: number) {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Linha ${rowNumber}: campo "${field}" inválido`);
    }
    return parsed;
  }

  private parseDecimal(value: any, field: string, rowNumber: number) {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (typeof value === 'number') {
      return Number(value);
    }
    const normalized = String(value)
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(normalized);
    if (Number.isNaN(parsed)) {
      throw new Error(`Linha ${rowNumber}: campo "${field}" inválido`);
    }
    return parsed;
  }

  private parseBoolean(value: any, field: string, rowNumber: number) {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const text = String(value).toLowerCase().trim();
    // Aceita: sim, não, há, não há, true, false, 1, 0
    if (text.includes('há') && !text.includes('não')) {
      return true;
    }
    if (text.includes('não') || text === 'nao') {
      return false;
    }
    if (['sim', 'yes', 'true', '1'].includes(text)) {
      return true;
    }
    if (['não', 'nao', 'no', 'false', '0'].includes(text)) {
      return false;
    }
    return undefined;
  }

  private parseDate(
    value: any,
    field: string,
    rowNumber: number,
    options: { allowTime?: boolean } = {},
  ) {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return this.formatDate(value, options.allowTime);
    }

    if (typeof value === 'number') {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (parsed) {
        const date = new Date(
          parsed.y,
          parsed.m - 1,
          parsed.d,
          parsed.H || 0,
          parsed.M || 0,
        );
        return this.formatDate(date, options.allowTime && Boolean(parsed.H || parsed.M));
      }
    }

    const text = String(value).trim();
    if (!text) return undefined;

    const [datePart, timePart] = text.split(/\s+/);
    const dateSegments = datePart.split(/[\/\-]/);
    if (dateSegments.length < 3) {
      throw new Error(`Linha ${rowNumber}: campo "${field}" inválido`);
    }
    const day = parseInt(dateSegments[0], 10);
    const month = parseInt(dateSegments[1], 10);
    const year = parseInt(dateSegments[2], 10);
    const hour = timePart ? parseInt(timePart.split(':')[0] || '0', 10) : 0;
    const minute = timePart ? parseInt(timePart.split(':')[1] || '0', 10) : 0;

    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      day > 31 ||
      month > 12
    ) {
      throw new Error(`Linha ${rowNumber}: campo "${field}" inválido`);
    }

    const date = new Date(year, month - 1, day, hour, minute);
    return this.formatDate(date, options.allowTime && Boolean(timePart));
  }

  private formatDate(date: Date, includeTime?: boolean) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    if (includeTime) {
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
    }

    return `${yyyy}-${mm}-${dd}`;
  }

  private parseEventos(row: NormalizedRow, rowNumber: number) {
    const eventosMap = new Map<
      number,
      { data?: string; valor?: number; tipo?: string }
    >();

    Object.entries(row).forEach(([key, value]) => {
      const match = key.match(/^evento(\d+)_(data|valor|tipo)$/);
      if (!match) return;
      const index = parseInt(match[1], 10);
      if (!eventosMap.has(index)) {
        eventosMap.set(index, {});
      }
      const current = eventosMap.get(index)!;
      if (match[2] === 'data') {
        current.data = this.parseDate(value, key, rowNumber) || undefined;
      } else if (match[2] === 'valor') {
        current.valor = this.parseDecimal(value, key, rowNumber);
      } else if (match[2] === 'tipo') {
        const tipoRaw = this.getString({ [key]: value }, key, rowNumber);
        // Remover parênteses se existirem: (Cronológica) -> Cronológica
        current.tipo = tipoRaw?.replace(/^\(|\)$/g, '').trim();
      }
    });

    const eventos: Array<{ data: string; valor: number; tipo: string }> = [];
    Array.from(eventosMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([, value]) => {
        if (value.data && typeof value.valor === 'number' && value.tipo) {
          eventos.push({
            data: value.data,
            valor: value.valor,
            tipo: value.tipo,
          });
        }
      });

    return eventos;
  }

  private buildSelectiveUpdate(dto: CreatePrecatorioDto, existing: any): { diff: Partial<CreatePrecatorioDto>, changes: string[] } {
    const updateData: any = {};
    const changes: string[] = [];

    // Comparar cada campo e adicionar ao update apenas se for diferente
    const fieldsToCompare = [
      'enteId', 'tribunalId', 'npu', 'processoOriginario', 'natureza',
      'fonte', 'ordemCronologica', 'anoLoa', 'dataLoa', 'dataTransmissao',
      'valorAcao', 'valorAberto', 'superPreferencia', 'advogadosDevedora',
      'advogadosCredora', 'observacoes', 'dataAtualizacao'
    ];

    for (const field of fieldsToCompare) {
      const dtoValue = dto[field as keyof CreatePrecatorioDto];
      const existingValue = existing[field];

      // Se o DTO tem valor e é diferente do existente, adiciona ao update
      if (dtoValue !== undefined && dtoValue !== null) {
        // Para campos Decimal, comparar como números com tolerância
        if (field === 'valorAcao' || field === 'valorAberto') {
          const dtoNum = Number(dtoValue);
          const existingNum = existingValue ? Number(existingValue) : null;
          if (existingNum === null || Math.abs(dtoNum - existingNum) > 0.001) {
            updateData[field] = dtoValue;
            changes.push(`${field}: ${existingNum} -> ${dtoNum}`);
          }
        }
        // Para datas, usar comparação inteligente
        else if (field.includes('data') || field.includes('Data')) {
          if (!this.areDatesEqual(dtoValue, existingValue)) {
            updateData[field] = dtoValue;
            changes.push(`${field}: ${this.formatValue(existingValue)} -> ${this.formatValue(dtoValue)}`);
          }
        }
        // Para booleanos
        else if (typeof dtoValue === 'boolean') {
          if (dtoValue !== existingValue) {
            updateData[field] = dtoValue;
            changes.push(`${field}: ${existingValue} -> ${dtoValue}`);
          }
        }
        // Para outros campos, comparação direta de string
        else if (String(dtoValue).trim() !== String(existingValue || '').trim()) {
          // Evitar atualizar se ambos forem vazios/nulos
          if (dtoValue || existingValue) {
            updateData[field] = dtoValue;
            changes.push(`${field}: "${existingValue || ''}" -> "${dtoValue}"`);
          }
        }
      }
    }

    return { diff: updateData, changes };
  }

  private formatValue(val: any): string {
    if (val === null || val === undefined) return 'vazio';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return String(val);
  }

  private areDatesEqual(newVal: any, oldVal: any): boolean {
    if (!newVal && !oldVal) return true;
    if (!newVal || !oldVal) return false;

    try {
      // Se o novo valor é string YYYY-MM-DD (sem T), comparamos apenas a parte da data
      const isDateOnly = typeof newVal === 'string' && newVal.length === 10 && !newVal.includes('T');

      const d1 = new Date(newVal);
      const d2 = new Date(oldVal);

      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;

      if (isDateOnly) {
        // Compara apenas YYYY-MM-DD (UTC)
        return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
      }

      // Compara ISO completo
      return d1.toISOString() === d2.toISOString();
    } catch {
      return false;
    }
  }



  private getEventChanges(dtoEventos: any[], existingEventos: any[]): string[] {
    const changes: string[] = [];

    // Se a quantidade de eventos mudou, há mudança
    if (dtoEventos.length !== existingEventos.length) {
      changes.push(`Qtd Eventos: ${existingEventos.length} -> ${dtoEventos.length}`);
      return changes;
    }

    // Comparar cada evento
    for (let i = 0; i < dtoEventos.length; i++) {
      const dtoEvento = dtoEventos[i];
      const existingEvento = existingEventos.find(e => e.ordem === i + 1);

      if (!existingEvento) {
        changes.push(`Evento ${i + 1}: Novo`);
        continue;
      }

      // Comparar data usando a lógica inteligente
      if (!this.areDatesEqual(dtoEvento.data, existingEvento.data)) {
        changes.push(`Evento ${i + 1} Data: ${this.formatValue(existingEvento.data)} -> ${this.formatValue(dtoEvento.data)}`);
      }

      // Comparar valor com tolerância
      if (Math.abs(Number(dtoEvento.valor) - Number(existingEvento.valor)) > 0.001) {
        changes.push(`Evento ${i + 1} Valor: ${existingEvento.valor} -> ${dtoEvento.valor}`);
      }

      // Comparar tipo
      if (dtoEvento.tipo !== existingEvento.tipo) {
        changes.push(`Evento ${i + 1} Tipo: ${existingEvento.tipo} -> ${dtoEvento.tipo}`);
      }
    }

    return changes;
  }

  private async ensureEnteExists(enteId: string, rowNumber: number) {
    const ente = await this.prisma.ente.findUnique({ where: { id: enteId } });
    if (!ente) {
      throw new Error(`Linha ${rowNumber}: ente_id "${enteId}" não existe`);
    }
  }

  private async ensureTribunalExists(tribunalId: string, rowNumber: number) {
    const tribunal = await this.prisma.tribunal.findUnique({ where: { id: tribunalId } });
    if (!tribunal) {
      throw new Error(
        `Linha ${rowNumber}: tribunal_id "${tribunalId}" não existe`,
      );
    }
  }
}
