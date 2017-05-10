import { Point } from '../struct/point';
import { Tool } from './tool';
import { _MouseOrTouchAction, isMouseAction, isTouchAction } from '../action/mouseOrTouch';


export abstract class MouseOrTouchTool<A extends _MouseOrTouchAction> implements Tool<A>{
    
    abstract onAction(action: A): void;

    /**
     * Gets either the cursor (in case of mouse action) or the first pointer down (in case of touch action).
     */
    getPrimaryPointer(action: A): Point {
        if(isMouseAction(action)){
            return action.cursor;
        } else if(isTouchAction(action)){
            return action.pointers[0];
        } else {
            return null;
        }
    }
}

