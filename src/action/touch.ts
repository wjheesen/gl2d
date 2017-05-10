import { _Surface } from '../rendering/surface';
import {Action} from './action'
import {Status} from './status'
import {Point} from '../struct/point'

export interface TouchAction<S extends _Surface> extends Action<S, TouchEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position in world space of each of the pointers that are currently down.
     */
    pointers: Point[];
}

export type _TouchAction = TouchAction<_Surface>;