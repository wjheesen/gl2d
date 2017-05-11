import { _Surface } from '../rendering/surface';
import { IPoint } from '../struct/point';
import { Tool } from './tool';
import { MouseOrTouchAction, isMouseAction, isTouchAction } from '../action/mouseOrTouch';


export abstract class MouseOrTouchTool<S extends _Surface> implements Tool<MouseOrTouchAction<S>>{
    
    abstract onAction(action: MouseOrTouchAction<S>): void;

    /**
     * Gets either the cursor (in case of mouse action) or the first pointer down (in case of touch action).
     */
    getPrimaryPointer(action: MouseOrTouchAction<S>): IPoint {
        if(isMouseAction(action)){
            return action.cursor;
        } else if(isTouchAction(action)){
            return action.pointers[0];
        } else {
            return null;
        }
    }
}

export abstract class _MouseOrTouchTool extends MouseOrTouchTool<_Surface>{}

