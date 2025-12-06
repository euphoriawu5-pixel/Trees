export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: [number, number, number];
  treePosition: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}

export interface OrnamentData extends ParticleData {
  type: 'BAUBLE' | 'BOX' | 'LIGHT';
  color: string;
}
