'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EnteRelation {
  id: string;
  nome: string;
  tipo?: string | null;
  entePrincipal?: { id: string | null } | null;
}

interface EnteHierarchySelectProps {
  entes: EnteRelation[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
}

interface EnteNode {
  id: string;
  nome: string;
  tipo?: string | null;
  children: EnteNode[];
}

const tipoLabels: Record<string, string> = {
  MUNICIPIO: 'Município',
  ESTADO: 'Estado',
  UNIAO: 'União',
  AUTARQUIA: 'Autarquia',
  FUNDACAO: 'Fundação',
  EMPRESA_PUBLICA: 'Empresa Pública',
  SOCIEDADE_ECONOMIA_MISTA: 'Sociedade de Economia Mista',
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const buildTree = (entes: EnteRelation[]) => {
  const nodeMap = new Map<string, EnteNode>();
  const roots: EnteNode[] = [];

  entes.forEach((ente) => {
    nodeMap.set(ente.id, {
      id: ente.id,
      nome: ente.nome,
      tipo: ente.tipo,
      children: [],
    });
  });

  entes.forEach((ente) => {
    const parentId = ente.entePrincipal?.id || null;
    const node = nodeMap.get(ente.id);
    if (!node) return;

    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: EnteNode[]) => {
    nodes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    nodes.forEach((child) => sortNodes(child.children));
  };

  sortNodes(roots);
  return roots;
};

const filterTree = (nodes: EnteNode[], term: string): EnteNode[] => {
  if (!term) return nodes;

  return nodes
    .map((node) => {
      const children = filterTree(node.children, term);
      const matches = normalize(node.nome).includes(term);

      if (matches || children.length) {
        return {
          ...node,
          children,
        };
      }

      return null;
    })
    .filter(Boolean) as EnteNode[];
};

export function EnteHierarchySelect({
  entes,
  value,
  onChange,
  label,
  placeholder = 'Buscar ente...',
  helperText,
  required,
  allowClear,
  clearLabel = 'Nenhum ente vinculado',
  className,
}: EnteHierarchySelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    entes.forEach((ente) => {
      map.set(ente.id, ente.entePrincipal?.id ?? null);
    });
    return map;
  }, [entes]);

  const tree = useMemo(() => buildTree(entes), [entes]);
  const normalizedTerm = normalize(searchTerm.trim());
  const filteredTree = useMemo(
    () => (normalizedTerm ? filterTree(tree, normalizedTerm) : tree),
    [tree, normalizedTerm]
  );

  useEffect(() => {
    if (!value) return;

    setExpandedIds((prev) => {
      const next = { ...prev };
      let current = parentMap.get(value) ?? null;
      let hasChanges = false;

      while (current) {
        if (!next[current]) {
          next[current] = true;
          hasChanges = true;
        }
        current = parentMap.get(current) ?? null;
      }

      return hasChanges ? next : prev;
    });
  }, [value, parentMap]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelect = (id: string) => {
    onChange(id);
  };

  const renderNode = (node: EnteNode, level = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = searchTerm ? true : expandedIds[node.id];
    const isSelected = value === node.id;

    return (
      <li key={node.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1 transition-colors',
            isSelected
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'
          )}
          style={{ paddingLeft: level * 16 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label={isExpanded ? 'Recolher' : 'Expandir'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <button
            type="button"
            onClick={() => handleSelect(node.id)}
            className="flex-1 text-left"
          >
            <span className="text-sm font-medium">{node.nome}</span>
            {node.tipo && (
              <span className={cn('ml-2 text-xs', isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400')}>
                {tipoLabels[node.tipo] || node.tipo}
              </span>
            )}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <ul className="space-y-1">
            {node.children.map((child) => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {allowClear && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={cn(
              'w-full text-left px-3 py-2 border rounded-lg text-sm transition-colors',
              value === ''
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
            )}
          >
            {clearLabel}
          </button>
        )}

        <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/40">
          {filteredTree.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-2 py-4 text-center">
              Nenhum ente encontrado com esse filtro
            </p>
          ) : (
            <ul className="space-y-1">{filteredTree.map((node) => renderNode(node))}</ul>
          )}
        </div>

        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}

        {required && (
          <input
            tabIndex={-1}
            className="sr-only"
            value={value}
            onChange={() => {}}
            required
          />
        )}
      </div>
    </div>
  );
}
