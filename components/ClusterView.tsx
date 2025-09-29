
import React from 'react';
import { TiDBNode, NodeType, NodeStatus } from '../types';
import { PdIcon } from './icons/PdIcon';
import { TidbIcon } from './icons/TidbIcon';
import { TikvIcon } from './icons/TikvIcon';
import { DataRegionIcon } from './icons/DataRegionIcon';

interface ClusterViewProps {
  clusterState: TiDBNode[];
}

const getNodeStatusColor = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.ACTIVE:
      return 'border-cyan-400 text-cyan-400';
    case NodeStatus.JOINING:
      return 'border-green-400 text-green-400 animate-pulse';
    case NodeStatus.DRAINING:
      return 'border-amber-400 text-amber-400 animate-pulse';
    case NodeStatus.OFFLINE:
      return 'border-red-500 text-red-500';
    default:
      return 'border-slate-600 text-slate-400';
  }
};

const regionColorMap: { [key: string]: { text: string } } = {
  'Region 1': { text: 'text-red-400' },
  'Region 2': { text: 'text-green-400' },
  'Region 3': { text: 'text-orange-400' },
  'Region 4': { text: 'text-blue-400' },
  'Region 5': { text: 'text-purple-400' },
  'Region 6': { text: 'text-yellow-400' },
  'Region 7': { text: 'text-pink-400' },
  'Region 8': { text: 'text-indigo-400' },
  'Region 9': { text: 'text-teal-400' },
  'Region 10': { text: 'text-lime-400' },
  'Region 11': { text: 'text-rose-400' },
  'Region 12': { text: 'text-sky-400' },
};
const defaultColor = { text: 'text-slate-400' };


const Node: React.FC<{ node: TiDBNode }> = ({ node }) => {
  const isPd = node.type === NodeType.PD;

  const iconMap = {
    [NodeType.PD]: <PdIcon className="w-6 h-6" />,
    [NodeType.TIDB]: <TidbIcon className="w-8 h-8" />,
    [NodeType.TIKV]: <TikvIcon className="w-8 h-8" />,
  };
  
  const statusClasses = getNodeStatusColor(node.status);

  // Conditional classes for smaller PD nodes
  const containerPadding = isPd ? 'p-3' : 'p-4';
  const contentGap = isPd ? 'gap-2' : 'gap-3';
  const idTextSize = isPd ? 'text-sm' : '';

  return (
    <div className={`relative bg-slate-900/50 rounded-lg border-2 transition-all duration-500 ${statusClasses} ${containerPadding}`}>
      <div className={`flex items-center ${contentGap}`}>
        {iconMap[node.type]}
        <div>
            <p className={`font-bold text-slate-100 ${idTextSize}`}>{node.id}</p>
            <p className="text-xs uppercase tracking-wider font-semibold">{node.status}</p>
             {node.leader && (
                <p className="text-xs uppercase tracking-wider font-bold text-yellow-400">Leader</p>
            )}
        </div>
      </div>
      {node.type === NodeType.TIKV && node.dataRegions && (
        <div className="mt-4 flex flex-row flex-wrap gap-1.5 p-3 bg-slate-950/50 rounded-md min-h-[6rem]">
          {node.dataRegions.length > 0 ? (
            node.dataRegions.map(region => {
              const colors = regionColorMap[region.name] || defaultColor;
              return (
                <div 
                  key={region.id} 
                  className={`relative transition-all duration-300 ${colors.text}`}
                  title={`${region.name}${region.leader ? ' (Leader)' : ''}`}
                >
                  <DataRegionIcon className="w-4 h-4" />
                   {region.leader && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full border-2 border-slate-800" title={`${region.name} Leader`}></div>
                  )}
                </div>
              );
            })
          ) : (
             <div className="flex items-center justify-center w-full h-full">
                <p className="text-slate-500 text-center text-sm">No Regions</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ClusterView: React.FC<ClusterViewProps> = ({ clusterState }) => {
  const pdNodes = clusterState.filter(n => n.type === NodeType.PD);
  const tidbNodes = clusterState.filter(n => n.type === NodeType.TIDB);
  const tikvNodes = clusterState.filter(n => n.type === NodeType.TIKV);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PD Column */}
      <div className="w-full lg:w-48 flex-shrink-0">
         <h3 className="text-lg font-semibold text-slate-300 mb-3 border-b-2 border-slate-700 pb-2">PD (Placement Driver)</h3>
         <div className="flex flex-row lg:flex-col gap-3">
            {pdNodes.map(node => <Node key={node.id} node={node} />)}
         </div>
      </div>

      {/* Main Area */}
      <div className="flex-grow flex flex-col gap-6">
        {/* TiDB Row */}
        <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-3 border-b-2 border-slate-700 pb-2">TiDB (SQL Layer)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tidbNodes.map(node => <Node key={node.id} node={node} />)}
            </div>
        </div>

        {/* TiKV Grid */}
        <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-3 border-b-2 border-slate-700 pb-2">TiKV (Storage Layer)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tikvNodes.map(node => <Node key={node.id} node={node} />)}
            </div>
        </div>
      </div>
    </div>
  );
};
