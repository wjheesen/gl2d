import { _SurfaceMouseOrTouchEvent } from '../event/mouseOrTouch';
import { _MouseOrTouchTool } from './mouseOrTouch';
import { Status } from '../event/status';
import { Vec2 } from '../struct/vec2';
import { Point } from '../struct/point';

export class PanTool extends _MouseOrTouchTool {

    private previous: Point;

    onSurfaceEvent(event: _SurfaceMouseOrTouchEvent): void {
        // Check previous point is set
        if(!this.previous){
            return this.onStart(event);
        } 

        // Delegate based on status of action
        switch(event.status){
            case Status.Start:
                return this.onStart(event);
            case Status.Drag:
                return this.onDrag(event);
            case Status.End:
                this.previous = null;
        }
    }
    
    onStart(event: _SurfaceMouseOrTouchEvent) {
        this.previous = this.getPrimaryPointer(event);
    }

    onDrag(event: _SurfaceMouseOrTouchEvent) {
        let current = this.getPrimaryPointer(event);
        // Translate by vector from current point to previous point (reverse direction)
        let toPrevious = Vec2.fromPointToPoint(current, this.previous);
        let actual = event.target.offset(toPrevious);
        // Keep track of previous point
        this.previous.x = current.x + actual.x;
        this.previous.y = current.y + actual.y;
    }
}
   
  