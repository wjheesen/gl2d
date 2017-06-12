import { _Surface } from '../rendering/surface';
import { Point } from '../struct/point';
import { Tool } from './tool';
import { SurfaceMouseOrTouchEvent, isMouseAction, isTouchAction } from '../event/mouseOrTouch';


export abstract class MouseOrTouchTool<S extends _Surface> implements Tool<SurfaceMouseOrTouchEvent<S>>{
    
    abstract onSurfaceEvent(event: SurfaceMouseOrTouchEvent<S>): void;

    /**
     * Gets either the cursor (in case of mouse action) or the first pointer down (in case of touch action).
     */
    getPrimaryPointer(event: SurfaceMouseOrTouchEvent<S>): Point {
        if(isMouseAction(event)){
            return event.cursor;
        } else if(isTouchAction(event)){
            return event.pointers[0];
        } else {
            return null;
        }
    }
}

export abstract class _MouseOrTouchTool extends MouseOrTouchTool<_Surface>{}

