import { _SurfaceEvent } from '../event/surface';

export interface Tool<E extends _SurfaceEvent>{
    onSurfaceEvent(event: E): void;
}

export type _Tool = Tool<_SurfaceEvent>;