import { _MouseOrTouchAction } from '../action/mouseOrTouch';
import { MouseOrTouchTool } from './mouseOrTouch';
import { Status } from '../action/status';
import { Vec2 } from '../struct/vec2';
import { Point } from '../struct/point';

export class PanTool extends MouseOrTouchTool<_MouseOrTouchAction> {

    private previous: Point;

    onAction(action: _MouseOrTouchAction): void {
        // Check previous point is set
        if(!this.previous){
            return this.onStart(action);
        } 

        // Delegate based on status of action
        switch(action.status){
            case Status.Start:
                return this.onStart(action);
            case Status.Move:
                return this.onMove(action);
            case Status.End:
                this.previous = null;
        }
    }
    
    onStart(action: _MouseOrTouchAction) {
        this.previous = this.getPrimaryPointer(action);
    }

    onMove(action: _MouseOrTouchAction) {
        let current = this.getPrimaryPointer(action);
        // Translate by vector from current point to previous point (reverse direction)
        let toPrevious = Vec2.Obj.fromPointToPoint(current, this.previous);
        let actual = action.target.offset(toPrevious);
        // Keep track of previous point
        this.previous.x = current.x + actual.x;
        this.previous.y = current.y + actual.y;
    }
}
   
  