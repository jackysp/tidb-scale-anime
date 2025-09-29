export enum NodeType {
  PD = 'pd',
  TIDB = 'tidb',
  TIKV = 'tikv',
}

export enum NodeStatus {
  ACTIVE = 'active',
  JOINING = 'joining',
  DRAINING = 'draining',
  OFFLINE = 'offline',
}

export interface DataRegion {
  id: string; // Unique ID for each region instance
  name: string; // Non-unique name for grouping, e.g., 'Region 1'
  leader?: boolean;
}

export interface TiDBNode {
  id: string;
  type: NodeType;
  status: NodeStatus;
  dataRegions?: DataRegion[];
  leader?: boolean;
}

export interface LogEntry {
    id: number;
    message: string;
}