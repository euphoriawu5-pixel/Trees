import React, { useState } from 'react';
import { TreeState } from './types';
import Scene from './components/Scene';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Scene treeState={treeState} />
      <Overlay treeState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;