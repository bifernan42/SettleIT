import { useParams } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, edgeTypes } from './nodes/nodeTypes';
import { useFlowEditor, FlowEditorContext } from './hooks/useFlowEditor';
import AddNodeToolbar from './panels/AddNodeToolbar';
import NodeSettingsPanel from './panels/NodeSettingsPanel';

function FlowCanvas({ flowId }: { flowId: string }) {
  const {
    nodes,
    edges,
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
  } = useFlowEditor(flowId);

  return (
    <FlowEditorContext.Provider value={{ deleteNode, deleteEdge }}>
      <div className="relative w-full h-full">
        <AddNodeToolbar onAdd={addNode} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          deleteKeyCode="Delete"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <NodeSettingsPanel
          node={selectedNodeData}
          onClose={closePanel}
          onSave={updateNodeSettings}
          onDelete={deleteNode}
        />
      </div>
    </FlowEditorContext.Provider>
  );
}

export default function FlowEditorPage() {
  const { flowId } = useParams<{ flowId: string }>();

  if (!flowId) return <p className="text-muted-foreground p-8">No flow selected.</p>;

  return (
    <div className="-m-8 h-[calc(100vh-0px)]" style={{ height: 'calc(100vh - 0px)' }}>
      <ReactFlowProvider>
        <FlowCanvas flowId={flowId} />
      </ReactFlowProvider>
    </div>
  );
}
