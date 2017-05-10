import {Action} from './action'
import {Point} from '../struct/point'

export interface ScrollAction extends Action<WheelEvent | MouseEvent> {

    /**
     * True if scrolling uppwards; false if scrolling downwards.
     */
    isUpward: boolean;

    /**
     * The position of the cursor in world space.
     */
    cursor: Point;
}