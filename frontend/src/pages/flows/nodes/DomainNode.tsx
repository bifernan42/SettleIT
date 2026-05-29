import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DomainNode as DomainNodeData } from '../hooks/useFlowEditor';

const TYPE_STYLE: Record<string, string> = {
  TRIGGER: 'bg-green-50 border-green-300 text-green-800',
  ACTION: 'bg-blue-50 border-blue-300 text-blue-800',
  CONDITION: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  DELAY: 'bg-purple-50 border-purple-300 text-purple-800',
  END: 'bg-gray-50 border-gray-300 text-gray-600',
};

export default function DomainNode({ data, selected }: NodeProps) {
  const nodeData = data as DomainNodeData;
  const style = TYPE_STYLE[nodeData.type] ?? TYPE_STYLE.ACTION;

  return (
    <div
      className={`rounded-lg border-2 p-3 shadow-sm w-44 cursor-pointer transition-shadow ${style} ${
        selected ? 'ring-2 ring-primary ring-offset-1' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-xs font-bold uppercase tracking-wider">{nodeData.type}</p>
      <p className="mt-0.5 text-xs opacity-60 font-mono truncate">{nodeData.id.slice(0, 10)}</p>
      {Object.keys(nodeData.settings).length > 0 && (
        <p className="mt-1 text-xs opacity-50 truncate">
          {JSON.stringify(nodeData.settings).slice(0, 28)}…
        </p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
