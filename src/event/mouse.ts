import { _Surface } from '../rendering/surface';
import { IPoint } from '../struct/point';
import { Status } from './status';
import { SurfaceEvent } from './surface';

export interface SurfaceMouseEvent<S extends _Surface> extends SurfaceEvent<S, MouseEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position of the cursor in world space.
     */
    cursor: IPoint;
}

export type _SurfaceMouseEvent = SurfaceMouseEvent<_Surface>;