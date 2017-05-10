import { _Surface } from '../rendering/surface';
import {Action} from './action'
import {Status} from './status'
import {Point} from '../struct/point'

export interface MouseAction<S extends _Surface> extends Action<S, MouseEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position of the cursor in world space.
     */
    cursor: Point;
}

export type _MouseAction = MouseAction<_Surface>;