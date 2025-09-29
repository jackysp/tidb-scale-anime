import { TiDBNode, NodeType, NodeStatus, DataRegion } from './types';

export const MIN_TIKV_NODES = 3;
export const MAX_TIKV_NODES = 6;
export const MIN_TIDB_NODES = 1;
export const MAX_TIDB_NODES = 3;

// Fewer, larger regions for better visibility.
const REGIONS: { [key: string]: DataRegion[] } = {
  'TiKV 1': [
    { id: 'r1-a', name: 'Region 1', leader: true },
    { id: 'r2-a', name: 'Region 2' },
    { id: 'r3-a', name: 'Region 3' },
    { id: 'r4-a', name: 'Region 4' },
    { id: 'r5-a', name: 'Region 5', leader: true },
    { id: 'r6-a', name: 'Region 6' },
  ],
  'TiKV 2': [
    { id: 'r1-b', name: 'Region 1' },
    { id: 'r2-b', name: 'Region 2' },
    { id: 'r3-b', name: 'Region 3', leader: true },
    { id: 'r4-b', name: 'Region 4' },
    { id: 'r5-b', name: 'Region 5' },
    { id: 'r6-b', name: 'Region 6', leader: true },
  ],
  'TiKV 3': [
    { id: 'r1-c', name: 'Region 1' },
    { id: 'r2-c', name: 'Region 2', leader: true },
    { id: 'r3-c', name: 'Region 3' },
    { id: 'r4-c', name: 'Region 4', leader: true },
    { id: 'r5-c', name: 'Region 5' },
    { id: 'r6-c', name: 'Region 6' },
  ],
};


export const INITIAL_CLUSTER_STATE: TiDBNode[] = [
  // PD and TiDB nodes remain for architectural context
  { id: 'PD 1', type: NodeType.PD, status: NodeStatus.ACTIVE, leader: true },
  { id: 'PD 2', type: NodeType.PD, status: NodeStatus.ACTIVE },
  { id: 'PD 3', type: NodeType.PD, status: NodeStatus.ACTIVE },

  { id: 'TiDB 1', type: NodeType.TIDB, status: NodeStatus.ACTIVE },

  // TiKV nodes based on the "Scale-out (initial state)" diagram
  { id: 'TiKV 1', type: NodeType.TIKV, status: NodeStatus.ACTIVE, dataRegions: REGIONS['TiKV 1'] },
  { id: 'TiKV 2', type: NodeType.TIKV, status: NodeStatus.ACTIVE, dataRegions: REGIONS['TiKV 2'] },
  { id: 'TiKV 3', type: NodeType.TIKV, status: NodeStatus.ACTIVE, dataRegions: REGIONS['TiKV 3'] },
];