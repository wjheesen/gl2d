import {Action} from './action'
import {Status} from './status'
import {Point} from '../struct/point'

export interface TouchAction extends Action<TouchEvent>{

    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The position in world space of each of the pointers that are currently down.
     */
    pointers: Point[];
}