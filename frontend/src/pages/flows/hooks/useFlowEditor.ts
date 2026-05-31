import { createContext, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import {
  getReminderFlowsControllerFindEdgesQueryKey,
  getReminderFlowsControllerFindNodesQueryKey,
  useFlowEdgesControllerRemove,
  useFlowNodesControllerRemove,
  useFlowNodesControllerUpdate,
  useReminderFlowsControllerCreateEdge,
  useReminderFlowsControllerCreateNode,
  useReminderFlowsControllerFindEdges,
  useReminderFlowsControllerFindNodes,
} from '@/api/generated/reminder-flows/reminder-flows';
import type { CreateFlowNodeDtoType } from '@/api/generated/model';

export const FlowEditorContext = createContext<{
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
} | null>(null);

// ─── Domain types (shapes the API returns) ──────────────────────────────────

export type DomainNode = {
  id: string;
  flowId: string;
  type: string;
  settings: Record<string, unknown>;
  positionX: number;
  positionY: number;
};

export type DomainEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  conditionType: string;
};

// ─── Projection functions (pure — domain → React Flow) ──────────────────────

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

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFlowEditor(flowId: string) {
  const qc = useQueryClient();
  const reactFlow = useReactFlow();

  // ── Server queries ─────────────────────────────────────────────────────────
  const { data: apiNodes, isLoading: nodesLoading } = useReminderFlowsControllerFindNodes(flowId);
  const { data: apiEdges, isLoading: edgesLoading } = useReminderFlowsControllerFindEdges(flowId);

  // ── Local RF state (ephemeral — derived from server) ──────────────────────
  const [nodes, setNodes] = useState<Node<DomainNode>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (apiNodes) setNodes((apiNodes as DomainNode[]).map(toRFNode));
  }, [apiNodes]);

  useEffect(() => {
    if (apiEdges) setEdges((apiEdges as DomainEdge[]).map(toRFEdge));
  }, [apiEdges]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const patchNode = useFlowNodesControllerUpdate();
  const removeNode = useFlowNodesControllerRemove();
  const createNode = useReminderFlowsControllerCreateNode();
  const createEdge = useReminderFlowsControllerCreateEdge();
  const removeEdge = useFlowEdgesControllerRemove();

  // ── Selected node (side panel) ────────────────────────────────────────────
  const [selectedNodeData, setSelectedNodeData] = useState<DomainNode | null>(null);

  // ── React Flow event handlers ─────────────────────────────────────────────

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<DomainNode>[]);

      for (const change of changes) {
        // Persist position only on drag end — avoids N calls per pixel
        if (change.type === 'position' && change.dragging === false && change.position) {
          patchNode.mutate({
            nodeId: change.id,
            data: { positionX: change.position.x, positionY: change.position.y } as any,
          });
        }
        // Sync Delete-key removal to backend
        if (change.type === 'remove') {
          removeNode.mutate({ nodeId: change.id });
        }
      }
    },
    [patchNode, removeNode],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));

      for (const change of changes) {
        if (change.type === 'remove') {
          removeEdge.mutate({ edgeId: change.id });
        }
      }
    },
    [removeEdge],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      let conditionType: 'DEFAULT' | 'TRUE_BRANCH' | 'FALSE_BRANCH' = 'DEFAULT';
      if (connection.sourceHandle === 'true') conditionType = 'TRUE_BRANCH';
      else if (connection.sourceHandle === 'false') conditionType = 'FALSE_BRANCH';

      createEdge.mutate(
        {
          id: flowId,
          data: { sourceNodeId: connection.source, targetNodeId: connection.target, conditionType },
        },
        {
          onSuccess: () =>
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindEdgesQueryKey(flowId) }),
        },
      );
    },
    [flowId, createEdge, qc],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<DomainNode>) => {
    setSelectedNodeData(node.data);
  }, []);

  const closePanel = useCallback(() => setSelectedNodeData(null), []);

  // ── Explicit mutations for toolbar / panel ────────────────────────────────

  const addNode = useCallback(
    (type: CreateFlowNodeDtoType) => {
      const { x, y, zoom } = reactFlow.getViewport();
      const positionX = (-x + window.innerWidth / 2) / zoom;
      const positionY = (-y + window.innerHeight / 2) / zoom;

      createNode.mutate(
        { id: flowId, data: { type, settings: {}, positionX, positionY } },
        {
          onSuccess: () =>
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindNodesQueryKey(flowId) }),
        },
      );
    },
    [flowId, createNode, reactFlow, qc],
  );

  const updateNodeSettings = useCallback(
    (nodeId: string, settings: Record<string, unknown>) => {
      patchNode.mutate(
        { nodeId, data: { settings } as any },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindNodesQueryKey(flowId) });
            setSelectedNodeData((prev) => (prev?.id === nodeId ? { ...prev, settings } : prev));
          },
        },
      );
    },
    [flowId, patchNode, qc],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Optimistic: remove immediately so UI responds without waiting for refetch
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setSelectedNodeData((prev) => (prev?.id === nodeId ? null : prev));
      removeNode.mutate(
        { nodeId },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindNodesQueryKey(flowId) });
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindEdgesQueryKey(flowId) });
          },
          onError: () => {
            // Revert by re-fetching on failure
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindNodesQueryKey(flowId) });
          },
        },
      );
    },
    [flowId, removeNode, qc],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      // Optimistic: remove immediately
      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
      removeEdge.mutate(
        { edgeId },
        {
          onSuccess: () =>
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindEdgesQueryKey(flowId) }),
          onError: () =>
            qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindEdgesQueryKey(flowId) }),
        },
      );
    },
    [flowId, removeEdge, qc],
  );

  return {
    nodes,
    edges,
    isLoading: nodesLoading || edgesLoading,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    selectedNodeData,
    closePanel,
    addNode,
    updateNodeSettings,
    deleteNode,
    deleteEdge,
  };
}
