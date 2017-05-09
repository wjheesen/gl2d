import Action from './action'
import Point from '../struct/point'

interface MouseAction extends Action<MouseEvent>{
    /**
     * The position of the cursor in world space.
     */
    cursor: Point;
}

export default MouseAction;