import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/precatorios-import',
})
export class PrecatoriosImportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PrecatoriosImportGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  sendProgress(clientId: string | null, progress: ImportProgress) {
    const target = clientId || 'broadcast';
    this.logger.log(`Enviando progresso (${progress.percentage}%) para ${target}`);
    if (clientId) {
      this.server.to(clientId).emit('import-progress', progress);
    }
    this.server.emit('import-progress', progress);
  }

  sendComplete(clientId: string | null, result: ImportResult) {
    const target = clientId || 'broadcast';
    this.logger.log(`Importação concluída para ${target}: ${result.success}/${result.total}`);
    if (clientId) {
      this.server.to(clientId).emit('import-complete', result);
    }
    this.server.emit('import-complete', result);
  }

  sendError(clientId: string | null, error: string) {
    const target = clientId || 'broadcast';
    this.logger.error(`Erro na importação (${target}): ${error}`);
    if (clientId) {
      this.server.to(clientId).emit('import-error', { error });
    }
    this.server.emit('import-error', { error });
  }
}

export interface ImportProgress {
  total: number;
  current: number;
  percentage: number;
  status: string;
  currentRow?: number;
  preview?: {
    npu?: string;
    ente?: string;
  };
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    error: string;
    data?: Record<string, any>;
  }>;
}
