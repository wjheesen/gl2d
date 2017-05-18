import { _Surface } from '../rendering/surface';
import {Action} from './action'
import {Status} from './status'
import {IPoint} from '../struct/point'

export interface MouseAction<S extends _Surface> extends Action<S, MouseEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position of the cursor in world space.
     */
    cursor: IPoint;

    /**
     * True if the mouse is currently pressed.
     */
    isPressed: boolean;
}

export type _MouseAction = MouseAction<_Surface>;