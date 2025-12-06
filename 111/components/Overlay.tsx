import React from 'react';
import { TreeState } from '../types';
import { Sparkles, Box, TreeDeciduous } from 'lucide-react';

interface OverlayProps {
  treeState: TreeState;
  onToggle: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, onToggle }) => {
  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <div className="flex flex-col items-start space-y-2">
        <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-yellow-500/50" />
        <p className="text-emerald-100/80 font-light tracking-[0.2em] text-sm uppercase">
          Signature Collection
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end space-y-6 pointer-events-auto">
        <div className="flex flex-col items-end space-y-2 mb-4">
          <p className="text-white/40 text-xs tracking-widest uppercase">Current Mode</p>
          <div className="text-xl font-serif text-amber-100 tracking-wider">
            {isTree ? 'ASSEMBLED FORM' : 'AETHER SCATTER'}
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`
            group relative flex items-center justify-center w-16 h-16 rounded-full 
            border border-yellow-500/30 backdrop-blur-md transition-all duration-500
            ${isTree ? 'bg-emerald-900/40 hover:bg-emerald-800/60' : 'bg-amber-900/40 hover:bg-amber-800/60'}
            shadow-[0_0_20px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]
          `}
        >
          {isTree ? (
             <Sparkles className="w-6 h-6 text-yellow-200 transition-transform duration-500 group-hover:rotate-180" />
          ) : (
             <TreeDeciduous className="w-6 h-6 text-emerald-200 transition-transform duration-500 group-hover:scale-110" />
          )}
        </button>
      </div>

      {/* Footer / Decorative */}
      <div className="absolute bottom-8 left-8 text-[10px] text-white/20 font-mono tracking-widest hidden md:block">
        POS: {isTree ? '0.00, 0.00, 0.00' : 'RANDOMIZED'} <br/>
        PARTICLES: 15,400 <br/>
        RENDER: WEBGL 2.0
      </div>
    </div>
  );
};

export default Overlay;