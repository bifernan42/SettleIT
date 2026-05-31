import { useContext } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { DomainEdge } from '../hooks/useFlowEditor';
import { FlowEditorContext } from '../hooks/useFlowEditor';

const CONDITION_CONFIG = {
  TRUE_BRANCH: {
    label: '✓ Oui',
    stroke: '#22c55e',
    labelClass: 'bg-green-50 text-green-700 border-green-300',
  },
  FALSE_BRANCH: {
    label: '✗ Non',
    stroke: '#ef4444',
    labelClass: 'bg-red-50 text-red-600 border-red-300',
  },
  DEFAULT: {
    label: null,
    stroke: '#94a3b8',
    labelClass: '',
  },
} as const;

export default function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const ctx = useContext(FlowEditorContext);
  const edgeData = data as DomainEdge | undefined;
  const conditionType = (edgeData?.conditionType ?? 'DEFAULT') as keyof typeof CONDITION_CONFIG;
  const config = CONDITION_CONFIG[conditionType] ?? CONDITION_CONFIG.DEFAULT;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: config.stroke,
          strokeWidth: selected ? 2.5 : 2,
          strokeOpacity: selected ? 1 : 0.8,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="absolute nodrag nopan flex items-center gap-1"
        >
          {config.label && (
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border shadow-sm ${config.labelClass}`}
            >
              {config.label}
            </span>
          )}
          <button
            className="w-4 h-4 rounded-full bg-white border border-gray-300 text-gray-400 text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-300 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ opacity: selected ? 1 : undefined }}
            onClick={(e) => {
              e.stopPropagation();
              ctx?.deleteEdge(id);
            }}
            title="Supprimer cette connexion"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
