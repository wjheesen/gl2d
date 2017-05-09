import Action from './action'
import Point from '../struct/point'

interface TouchAction extends Action<TouchEvent>{
    /**
     * The position in world space of each of the pointers that are currently down.
     */
    pointers: Point[];
}

export default TouchAction