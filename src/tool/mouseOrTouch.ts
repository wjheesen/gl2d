import { _Surface } from '../rendering/surface';
import { IPoint } from '../struct/point';
import { Tool } from './tool';
import { SurfaceMouseOrTouchEvent, isMouseAction, isTouchAction } from '../event/mouseOrTouch';


export abstract class MouseOrTouchTool<S extends _Surface> implements Tool<SurfaceMouseOrTouchEvent<S>>{
    
    abstract onAction(action: SurfaceMouseOrTouchEvent<S>): void;

    /**
     * Gets either the cursor (in case of mouse action) or the first pointer down (in case of touch action).
     */
    getPrimaryPointer(action: SurfaceMouseOrTouchEvent<S>): IPoint {
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

