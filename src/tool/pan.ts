import { _SurfaceMouseOrTouchEvent } from '../event/mouseOrTouch';
import { _MouseOrTouchTool } from './mouseOrTouch';
import { Status } from '../event/status';
import { Vec2 } from '../struct/vec2';
import { IPoint } from '../struct/point';

export class PanTool extends _MouseOrTouchTool {

    private previous: IPoint;

    onAction(action: _SurfaceMouseOrTouchEvent): void {
        // Check previous point is set
        if(!this.previous){
            return this.onStart(action);
        } 

        // Delegate based on status of action
        switch(action.status){
            case Status.Start:
                return this.onStart(action);
            case Status.Drag:
                return this.onDrag(action);
            case Status.End:
                this.previous = null;
        }
    }
    
    onStart(action: _SurfaceMouseOrTouchEvent) {
        this.previous = this.getPrimaryPointer(action);
    }

    onDrag(action: _SurfaceMouseOrTouchEvent) {
        let current = this.getPrimaryPointer(action);
        // Translate by vector from current point to previous point (reverse direction)
        let toPrevious = Vec2.fromPointToPoint(current, this.previous);
        let actual = action.target.offset(toPrevious);
        // Keep track of previous point
        this.previous.x = current.x + actual.x;
        this.previous.y = current.y + actual.y;
    }
}
   
  