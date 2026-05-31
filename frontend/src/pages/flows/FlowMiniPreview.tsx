import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useReminderFlowsControllerFindEdges, useReminderFlowsControllerFindNodes } from '@/api/generated/reminder-flows/reminder-flows';
import { edgeTypes, nodeTypes } from './nodes/nodeTypes';
import type { DomainEdge, DomainNode } from './hooks/useFlowEditor';

function toRFNode(dn: DomainNode): Node<DomainNode> {
  return {
    id: dn.id,
    type: 'domainNode',
    position: { x: dn.positionX ?? 0, y: dn.positionY ?? 0 },
    data: dn,
  };
}

function toRFEdge(de: DomainEdge): Edge {
  let sourceHandle: string | null = null;
  if (de.conditionType === 'TRUE_BRANCH') sourceHandle = 'true';
  else if (de.conditionType === 'FALSE_BRANCH') sourceHandle = 'false';
  return {
    id: de.id,
    source: de.sourceNodeId,
    target: de.targetNodeId,
    sourceHandle,
    type: 'conditionEdge',
    data: de,
  };
}

function MiniCanvas({ flowId }: { flowId: string }) {
  const { data: apiNodes } = useReminderFlowsControllerFindNodes(flowId);
  const { data: apiEdges } = useReminderFlowsControllerFindEdges(flowId);

  const nodes = ((apiNodes as DomainNode[] | undefined) ?? []).map(toRFNode);
  const edges = ((apiEdges as DomainEdge[] | undefined) ?? []).map(toRFEdge);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    />
  );
}

export function FlowMiniPreview({ flowId }: { flowId: string }) {
  return (
    <ReactFlowProvider>
      <div className="h-44 overflow-hidden pointer-events-none bg-muted/20">
        <MiniCanvas flowId={flowId} />
      </div>
    </ReactFlowProvider>
  );
}
