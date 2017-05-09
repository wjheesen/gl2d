import {Action} from './action'
import {Point} from '../struct/point'

export interface MouseAction extends Action<MouseEvent>{
    /**
     * The position of the cursor in world space.
     */
    cursor: Point;
}
