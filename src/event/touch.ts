import { _Surface } from '../rendering/surface';
import { IPoint } from '../struct/point';
import { Status } from './status';
import { SurfaceEvent } from './surface';

export interface SurfaceTouchEvent<S extends _Surface> extends SurfaceEvent<S, TouchEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position in world space of each of the pointers that are currently down.
     */
    pointers: IPoint[];
}

export type _SurfaceTouchEvent = SurfaceTouchEvent<_Surface>;