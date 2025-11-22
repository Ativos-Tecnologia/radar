'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Loader2,
  X,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';
const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL || API_URL.replace(/\/api\/v1$/, '') || 'http://localhost:3333';

type ImportProgress = {
  total: number;
  current: number;
  percentage: number;
  status: string;
  currentRow?: number;
  preview?: {
    npu?: string;
    ente?: string;
  };
};

type ImportResult = {
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
};

interface PrecatoriosImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PrecatoriosImportDialog({ open, onClose, onSuccess }: PrecatoriosImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const clientIdRef = useRef<string>('');

  const [socketConnected, setSocketConnected] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const resetState = useCallback(() => {
    setFile(null);
    setUploading(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const socket = io(`${WS_BASE}/precatorios-import`, {
      transports: ['websocket'],
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      clientIdRef.current = socket.id ?? clientIdRef.current;
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('import-progress', (data: ImportProgress) => {
      setProgress(data);
    });

    socket.on('import-error', (payload: { error: string }) => {
      setError(payload.error);
      setUploading(false);
    });

    socket.on('import-complete', (payload: ImportResult) => {
      setResult(payload);
      setUploading(false);
      onSuccess?.();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [open, onSuccess, resetState]);

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const blob = await api.precatorios.downloadTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-precatorios.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Não foi possível baixar o template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (newFile: File | null) => {
    if (!newFile) return;
    setFile(newFile);
    setProgress(null);
    setResult(null);
    setError(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files?.[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo .xlsx antes de enviar.');
      return;
    }
    if (!socketConnected && !clientIdRef.current) {
      setError('Aguardando conexão com o servidor. Tente novamente em instantes.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(null);
      setResult(null);

      await api.precatorios.importFromExcel(file, clientIdRef.current);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Falha ao iniciar importação');
    }
  };

  const summaryCards = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Processadas', value: result.total, color: 'text-blue-500' },
      { label: 'Sucesso', value: result.success, color: 'text-emerald-500' },
      { label: 'Falhas', value: result.failed, color: 'text-rose-500' },
      { label: 'Criadas', value: result.created, color: 'text-purple-500' },
      { label: 'Atualizadas', value: result.updated, color: 'text-amber-500' },
    ];
  }, [result]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-white/10">
        <button
          onClick={() => {
            onClose();
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="col-span-2 p-8 space-y-6">
            <header>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-500 dark:text-blue-300">Importador Inteligente</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Precatórios em Massa</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Faça upload da planilha padrão, acompanhe o processamento em tempo real e revise cada linha com
                feedback detalhado.
              </p>
            </header>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Passo 1</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Baixar template oficial</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contém instruções, formatos e exemplos prontos.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="flex items-center gap-2 rounded-full border border-blue-500 px-4 py-2 text-blue-600 transition hover:bg-blue-500/10 disabled:opacity-50 dark:border-blue-400 dark:text-blue-200"
                >
                  {downloadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Template
                </button>
              </div>
            </section>

            <section
              className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-white/20 dark:bg-black/20"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <CloudUpload className="mx-auto mb-4 h-10 w-10 text-blue-500 dark:text-blue-300" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Etapa 2 — Selecione o arquivo preenchido</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Arraste o .xlsx aqui ou clique para procurar.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 dark:bg-blue-500/80"
              >
                Escolher arquivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {file && (
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-blue-700 dark:text-blue-200">
                  <FileSpreadsheet className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Passo 3</p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enviar e acompanhar</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Você verá o progresso linha a linha em tempo real.</p>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 dark:bg-emerald-500/90"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  {uploading ? 'Processando...' : 'Iniciar importação'}
                </button>
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-100">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4" /> Problemas encontrados
                </p>
                <p className="mt-1 text-rose-700 dark:text-rose-200">{error}</p>
              </div>
            )}
          </div>

          <aside className="rounded-r-2xl bg-gray-100 p-6 flex flex-col gap-6 border-l border-gray-200 dark:bg-black/30 dark:border-white/5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-600 dark:text-gray-500">Conexão</p>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                {socketConnected ? 'Online com o processador' : 'Conectando...'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID do cliente: <span className="font-mono text-xs">{clientIdRef.current || '—'}</span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Status atual</p>
              <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {progress ? `${progress.percentage}% concluído` : 'Aguardando envio'}
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{progress?.status || 'Nenhum processamento em andamento.'}</p>

              <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all"
                  style={{ width: `${progress?.percentage ?? 0}%` }}
                />
              </div>

              {progress?.preview && (
                <div className="mt-4 rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-black/30 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Linha em foco</p>
                  <p>NPU: {progress.preview.npu || '—'}</p>
                  <p>Ente: {progress.preview.ente || '—'}</p>
                  <p>Linha: {progress.currentRow ?? '—'}</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" /> Importação finalizada
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-black/20">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {result.errors.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 max-h-60 overflow-y-auto dark:border-white/10 dark:bg-black/30">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-200">
                      <AlertCircle className="h-4 w-4" /> Linhas com problemas
                    </p>
                    <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      {result.errors.map((err) => (
                        <li key={`${err.row}-${err.error}`} className="rounded-md bg-gray-50 p-2 dark:bg-white/5">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">Linha {err.row}</p>
                          <p className="text-rose-600 dark:text-rose-200">{err.error}</p>
                          {err.data && (
                            <p className="mt-1 font-mono text-[10px] text-gray-500 truncate dark:text-gray-400">
                              {JSON.stringify(err.data)}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
