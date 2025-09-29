import React, { useState, useCallback, useEffect } from 'react';
import { ClusterView } from './components/ClusterView';
import { ControlPanel } from './components/ControlPanel';
import { TiDBNode, NodeStatus, NodeType, LogEntry } from './types';
import { INITIAL_CLUSTER_STATE, MAX_TIKV_NODES, MIN_TIKV_NODES, MIN_TIDB_NODES, MAX_TIDB_NODES } from './constants';
import { TidbIcon } from './components/icons/TidbIcon';

const App: React.FC = () => {
  const [clusterState, setClusterState] = useState<TiDBNode[]>(INITIAL_CLUSTER_STATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), message }]);
  }, []);

  useEffect(() => {
    addLog("Welcome! This animation shows TiDB's scaling capabilities.");
    addLog("The cluster is initialized and stable.");
  }, [addLog]);

  const rebalanceData = useCallback((currentState: TiDBNode[]): TiDBNode[] => {
    const activeTikvNodes = currentState.filter(n => n.type === NodeType.TIKV && n.status === NodeStatus.ACTIVE);
    if (activeTikvNodes.length === 0) return currentState;

    const allDataRegions = currentState
      .filter(n => n.type === NodeType.TIKV)
      .flatMap(n => n.dataRegions || []);
      
    const regionsPerNode = Math.floor(allDataRegions.length / activeTikvNodes.length);
    let remainder = allDataRegions.length % activeTikvNodes.length;

    let regionIndex = 0;
    const newState = currentState.map(node => {
      if (node.type === NodeType.TIKV) {
        if (activeTikvNodes.some(n => n.id === node.id)) {
            const numRegionsToAssign = regionsPerNode + (remainder > 0 ? 1 : 0);
            remainder--;
            const assignedRegions = allDataRegions.slice(regionIndex, regionIndex + numRegionsToAssign);
            regionIndex += numRegionsToAssign;
            return { ...node, dataRegions: assignedRegions };
        } else {
             return { ...node, dataRegions: [] };
        }
      }
      return node;
    });
    
    return newState;
  }, []);


  const handleScaleOut = useCallback(() => {
    if (isAnimating) return;
    const tikvCount = clusterState.filter(n => n.type === NodeType.TIKV).length;
    if (tikvCount >= MAX_TIKV_NODES) {
      addLog("Cannot scale out TiKV: Maximum number of nodes reached.");
      return;
    }

    setIsAnimating(true);
    addLog("Starting TiKV Scale Out process...");
    
    const tikvNodes = clusterState.filter(n => n.type === NodeType.TIKV);
    const newNodeNumber = tikvNodes.length + 1;
    const newNodeId = `TiKV ${newNodeNumber}`;

    addLog(`Preparing to add new node: ${newNodeId}.`);

    const newNode: TiDBNode = {
      id: newNodeId,
      type: NodeType.TIKV,
      status: NodeStatus.JOINING,
      dataRegions: [],
    };

    setClusterState(prev => [...prev, newNode]);

    setTimeout(() => {
      addLog(`Node ${newNodeId} is joining the cluster.`);
      setClusterState(prev => prev.map(n => n.id === newNodeId ? { ...n, status: NodeStatus.ACTIVE } : n));
      
      setTimeout(() => {
        addLog("Data rebalancing started to utilize the new node...");
        setClusterState(prev => rebalanceData(prev));
        
        setTimeout(() => {
          addLog("TiKV Scale Out complete. Cluster is stable.");
          setIsAnimating(false);
        }, 2000);
      }, 500);
    }, 1000);

  }, [isAnimating, clusterState, addLog, rebalanceData]);

  const handleScaleIn = useCallback(() => {
    if (isAnimating) return;
    const activeTikvNodes = clusterState.filter(n => n.type === NodeType.TIKV && n.status === NodeStatus.ACTIVE);
    if (activeTikvNodes.length <= MIN_TIKV_NODES) {
      addLog("Cannot scale in TiKV: Minimum number of nodes required.");
      return;
    }

    setIsAnimating(true);
    addLog("Starting TiKV Scale In process...");
    
    const nodeToDrain = activeTikvNodes[activeTikvNodes.length - 1];
    addLog(`Node ${nodeToDrain.id} selected for removal. Draining data...`);
    
    setClusterState(prev => prev.map(n => n.id === nodeToDrain.id ? { ...n, status: NodeStatus.DRAINING } : n));

    setTimeout(() => {
      const stateAfterDrain = clusterState.map(n => n.id === nodeToDrain.id ? { ...n, status: NodeStatus.DRAINING } : n);
      setClusterState(rebalanceData(stateAfterDrain));

      setTimeout(() => {
        addLog(`Data drain complete. Removing node ${nodeToDrain.id}.`);
        setClusterState(prev => prev.filter(n => n.id !== nodeToDrain.id));
        
        setTimeout(() => {
          addLog("TiKV Scale In complete. Cluster is stable.");
          setIsAnimating(false);
        }, 1000);
      }, 2000);
    }, 500);

  }, [isAnimating, clusterState, addLog, rebalanceData]);

  const handleScaleOutTidb = useCallback(() => {
    if (isAnimating) return;
    const tidbCount = clusterState.filter(n => n.type === NodeType.TIDB).length;
    if (tidbCount >= MAX_TIDB_NODES) {
        addLog("Cannot scale out TiDB: Maximum number of nodes reached.");
        return;
    }

    setIsAnimating(true);
    addLog("Starting TiDB Scale Out process...");

    const newNodeNumber = tidbCount + 1;
    const newNodeId = `TiDB ${newNodeNumber}`;
    addLog(`Preparing to add new node: ${newNodeId}.`);

    const newNode: TiDBNode = {
        id: newNodeId,
        type: NodeType.TIDB,
        status: NodeStatus.JOINING,
    };

    setClusterState(prev => [...prev, newNode]);

    setTimeout(() => {
        addLog(`Node ${newNodeId} is joining the cluster.`);
        setClusterState(prev => prev.map(n => n.id === newNodeId ? { ...n, status: NodeStatus.ACTIVE } : n));
        
        setTimeout(() => {
            addLog("TiDB Scale Out complete. Cluster is stable.");
            setIsAnimating(false);
        }, 500);
    }, 1000);
  }, [isAnimating, clusterState, addLog]);

  const handleScaleInTidb = useCallback(() => {
      if (isAnimating) return;
      const activeTidbNodes = clusterState.filter(n => n.type === NodeType.TIDB && n.status === NodeStatus.ACTIVE);
      if (activeTidbNodes.length <= MIN_TIDB_NODES) {
          addLog("Cannot scale in TiDB: Minimum number of nodes required.");
          return;
      }

      setIsAnimating(true);
      addLog("Starting TiDB Scale In process...");

      const nodeToRemove = activeTidbNodes[activeTidbNodes.length - 1];
      addLog(`Node ${nodeToRemove.id} selected for removal.`);

      setClusterState(prev => prev.map(n => n.id === nodeToRemove.id ? { ...n, status: NodeStatus.DRAINING } : n));
      
      setTimeout(() => {
          addLog(`Removing node ${nodeToRemove.id}.`);
          setClusterState(prev => prev.filter(n => n.id !== nodeToRemove.id));

          setTimeout(() => {
              addLog("TiDB Scale In complete. Cluster is stable.");
              setIsAnimating(false);
          }, 500);
      }, 1000);
  }, [isAnimating, clusterState, addLog]);


  const handleReset = useCallback(() => {
    if (isAnimating) return;
    addLog("Resetting cluster to initial state.");
    setClusterState(INITIAL_CLUSTER_STATE);
    // Keep logs for history, but could clear them: setLogs([]);
  }, [isAnimating, addLog]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
            <TidbIcon className="w-16 h-16" />
            <h1 className="text-4xl lg:text-5xl font-bold text-cyan-400">TiDB Elastic Scaling</h1>
        </div>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Visually demonstrating how TiDB, a distributed SQL database, handles scaling out (adding nodes) and scaling in (removing nodes) to adapt to workload changes, automatically rebalancing data for high performance and availability.
        </p>
      </header>
      
      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:w-2/3 bg-slate-800/50 rounded-xl p-4 lg:p-6 border border-slate-700 shadow-2xl shadow-slate-950/50">
           <ClusterView clusterState={clusterState} />
        </div>
        <div className="lg:w-1/3">
           <ControlPanel
            logs={logs}
            onScaleOut={handleScaleOut}
            onScaleIn={handleScaleIn}
            onScaleOutTidb={handleScaleOutTidb}
            onScaleInTidb={handleScaleInTidb}
            onReset={handleReset}
            isAnimating={isAnimating}
            tikvCount={clusterState.filter(n => n.type === NodeType.TIKV).length}
            tidbCount={clusterState.filter(n => n.type === NodeType.TIDB).length}
          />
        </div>
      </main>

      <footer className="text-center mt-8 text-slate-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;