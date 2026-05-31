import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import DomainNode from './DomainNode';
import ConditionEdge from '../edges/ConditionEdge';

export const nodeTypes: NodeTypes = {
  domainNode: DomainNode,
};

export const edgeTypes: EdgeTypes = {
  conditionEdge: ConditionEdge,
};
