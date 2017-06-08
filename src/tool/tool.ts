import { _SurfaceEvent } from '../event/surface';

export interface Tool<A extends _SurfaceEvent>{
    onAction(action: A): void;
}

export type _Tool = Tool<_SurfaceEvent>;