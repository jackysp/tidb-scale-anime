

import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { MAX_TIKV_NODES, MIN_TIKV_NODES, MIN_TIDB_NODES, MAX_TIDB_NODES } from '../constants';

interface ControlPanelProps {
  logs: LogEntry[];
  onScaleOut: () => void;
  onScaleIn: () => void;
  onScaleOutTidb: () => void;
  onScaleInTidb: () => void;
  onReset: () => void;
  isAnimating: boolean;
  tikvCount: number;
  tidbCount: number;
}

const Button: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-4 py-3 text-lg font-semibold rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ logs, onScaleOut, onScaleIn, onScaleOutTidb, onScaleInTidb, onReset, isAnimating, tikvCount, tidbCount }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const canScaleOut = tikvCount < MAX_TIKV_NODES;
  const canScaleIn = tikvCount > MIN_TIKV_NODES;
  const canScaleOutTidb = tidbCount < MAX_TIDB_NODES;
  const canScaleInTidb = tidbCount > MIN_TIDB_NODES;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-slate-100">Controls</h2>
      <div className="grid grid-cols-1 gap-y-6 mb-6">
        <div>
            <h3 className="text-lg font-semibold text-slate-300 -mb-1 text-center">TiDB (SQL)</h3>
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={onScaleOutTidb} 
                    disabled={isAnimating || !canScaleOutTidb}
                    className="bg-sky-600 hover:bg-sky-500 text-white focus:ring-sky-400"
                >
                Scale Out
                </Button>
                <Button 
                    onClick={onScaleInTidb} 
                    disabled={isAnimating || !canScaleInTidb}
                    className="bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-400"
                >
                Scale In
                </Button>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-300 -mb-1 text-center">TiKV (Storage)</h3>
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={onScaleOut} 
                    disabled={isAnimating || !canScaleOut}
                    className="bg-green-600 hover:bg-green-500 text-white focus:ring-green-400"
                >
                Scale Out
                </Button>
                <Button 
                    onClick={onScaleIn} 
                    disabled={isAnimating || !canScaleIn}
                    className="bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-400"
                >
                Scale In
                </Button>
            </div>
        </div>
        <div className="pt-4 border-t border-slate-700">
            <Button 
                onClick={onReset} 
                disabled={isAnimating}
                className="bg-red-700 hover:bg-red-600 text-white focus:ring-red-500"
            >
            Reset Cluster
            </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-2 text-slate-100">Event Log</h2>
      <div className="flex-grow bg-slate-900/70 rounded-md p-4 overflow-y-auto h-64 font-mono text-sm text-slate-300 border border-slate-700">
        {logs.map(log => (
          <p key={log.id} className="animate-fade-in">&gt; {log.message}</p>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

// Add keyframes for a subtle fade-in animation for logs in your index.html or a global style if you had one.
// For now, this class name is a placeholder for a potential CSS animation.
// A simple way to do it with just Tailwind would be to manage opacity state, but that's overkill here.