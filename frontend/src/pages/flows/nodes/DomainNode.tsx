import { useContext } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DomainNode as DomainNodeData } from '../hooks/useFlowEditor';
import { FlowEditorContext } from '../hooks/useFlowEditor';

// ─── Styles par type ─────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, { card: string; badge: string }> = {
  TRIGGER: {
    card: 'border-green-400 bg-green-50 text-green-900',
    badge: 'bg-green-100 text-green-700',
  },
  ACTION: {
    card: 'border-blue-400 bg-blue-50 text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
  },
  CONDITION: {
    card: 'border-amber-400 bg-amber-50 text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
  },
  DELAY: {
    card: 'border-purple-400 bg-purple-50 text-purple-900',
    badge: 'bg-purple-100 text-purple-700',
  },
  END: {
    card: 'border-gray-400 bg-gray-50 text-gray-700',
    badge: 'bg-gray-100 text-gray-500',
  },
};

// ─── Labels & emojis lisibles ────────────────────────────────────────────────

function getEmoji(data: DomainNodeData): string {
  if (data.type === 'TRIGGER') return '🚀';
  if (data.type === 'END') return '🏁';
  if (data.type === 'DELAY') return '⏳';
  if (data.type === 'ACTION') {
    const t = data.settings?.actionType as string | undefined;
    if (t === 'EMAIL') return '📧';
    if (t === 'SMS') return '💬';
    if (t === 'WHATSAPP') return '🟢';
    if (t === 'COURRIER') return '📮';
    return '📤';
  }
  if (data.type === 'CONDITION') {
    const cat = data.settings?.conditionCategory as string | undefined;
    const field = data.settings?.field as string | undefined;
    if (cat === 'DATA_AVAILABLE') {
      if (field === 'email') return '📧';
      if (field === 'whatsapp') return '🟢';
      return '📱';
    }
    if (cat === 'ACTION_RESULT') return '🔍';
    return '❓';
  }
  return '⚙️';
}

function getLabel(data: DomainNodeData): string {
  if (data.type === 'TRIGGER') return 'Examen effectué';
  if (data.type === 'END') return 'Fin du workflow';
  if (data.type === 'DELAY') {
    const days = data.settings?.delayDays as number | undefined;
    if (days) return `Attendre ${days} jour${days > 1 ? 's' : ''}`;
    return 'Délai (non configuré)';
  }
  if (data.type === 'ACTION') {
    const t = data.settings?.actionType as string | undefined;
    if (t === 'EMAIL') return 'Envoi Email';
    if (t === 'SMS') return 'Envoi SMS';
    if (t === 'WHATSAPP') return 'Envoi WhatsApp';
    if (t === 'COURRIER') return 'Envoi Courrier';
    return 'Action (non configurée)';
  }
  if (data.type === 'CONDITION') {
    const cat = data.settings?.conditionCategory as string | undefined;
    const field = data.settings?.field as string | undefined;
    const check = data.settings?.check as string | undefined;
    if (cat === 'DATA_AVAILABLE') {
      if (field === 'email') return 'Email connu ?';
      if (field === 'phone') return 'Tél. connu ?';
      if (field === 'whatsapp') return 'WhatsApp dispo ?';
      return 'Donnée disponible ?';
    }
    if (cat === 'ACTION_RESULT') {
      if (check === 'rejected') return 'Email rejeté ?';
      if (check === 'opened') return 'Email ouvert ?';
      if (check === 'undelivered') return 'SMS non délivré ?';
      return 'Résultat action ?';
    }
    return 'Condition (non configurée)';
  }
  return data.type;
}

const TYPE_LABELS: Record<string, string> = {
  TRIGGER: 'Départ',
  ACTION: 'Action',
  CONDITION: 'Condition',
  DELAY: 'Délai',
  END: 'Fin',
};

// ─── Composant ───────────────────────────────────────────────────────────────

export default function DomainNode({ data, selected }: NodeProps) {
  const nodeData = data as DomainNodeData;
  const ctx = useContext(FlowEditorContext);
  const style = TYPE_STYLE[nodeData.type] ?? TYPE_STYLE.ACTION;
  const isCondition = nodeData.type === 'CONDITION';
  const isTrigger = nodeData.type === 'TRIGGER';
  const isEnd = nodeData.type === 'END';

  return (
    <div
      className={`relative group rounded-xl border-2 shadow-sm w-52 transition-all ${style.card} ${
        selected ? 'ring-2 ring-primary ring-offset-2 shadow-md' : 'hover:shadow-md'
      }`}
    >
      {/* Bouton supprimer */}
      <button
        className="absolute -top-2.5 -right-2.5 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs leading-none shadow hover:bg-red-600 z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          ctx?.deleteNode(nodeData.id);
        }}
        title="Supprimer ce nœud"
      >
        ×
      </button>

      {/* Handle entrant (tous sauf TRIGGER) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-400 !border-white !border-2 !w-3 !h-3"
        />
      )}

      {/* Corps du nœud */}
      <div className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none mt-0.5">{getEmoji(nodeData)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">{getLabel(nodeData)}</p>
            <span
              className={`mt-1 inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}
            >
              {TYPE_LABELS[nodeData.type] ?? nodeData.type}
            </span>
          </div>
        </div>
      </div>

      {/* Handles sortants */}
      {isCondition ? (
        <div className="relative pb-5">
          {/* Labels des branches */}
          <div className="flex justify-between px-3 pb-1">
            <span className="text-[10px] font-semibold text-green-600">✓ Oui</span>
            <span className="text-[10px] font-semibold text-red-500">✗ Non</span>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '25%' }}
            className="!bg-green-500 !border-white !border-2 !w-3.5 !h-3.5"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '75%' }}
            className="!bg-red-500 !border-white !border-2 !w-3.5 !h-3.5"
          />
        </div>
      ) : !isEnd ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-gray-400 !border-white !border-2 !w-3 !h-3"
        />
      ) : null}
    </div>
  );
}
