import { Vec2 } from '../struct/vec2';
import { Status } from '../action/status';
import { _TouchAction } from '../action/touch';
import { _TouchTool } from './touch';
import { IPoint, Point } from "../struct/point";

export class PinchZoomTool implements _TouchTool {

    private previousSpan: number;
    private previousFocus: IPoint;

    onAction(action: _TouchAction): void {
        // Check two pointers are down
        if(action.pointers.length < 2){
            return;
        }
        // Check previous focus point is set
        if(!this.previousFocus){
            return this.onStart(action);
        } 
        // Delegate based on status of action
        switch(action.status){
            case Status.Start:
                return this.onStart(action);
            case Status.Move:
                return this.onMove(action);
            case Status.End:
                this.previousFocus = null;
        }
    }

    onStart(action: _TouchAction) {
        let p1 = action.pointers[0];
        let p2 = action.pointers[1];
        this.previousSpan = IPoint.distance(p1, p2);
        this.previousFocus = Point.midpoint(p1, p2);
    }

    onMove(action: _TouchAction) {
        let p1 = action.pointers[0];
        let p2 = action.pointers[1];
        let span = IPoint.distance(p1, p2);
        let focus = Point.midpoint(p1, p2);
        let surface = action.target;
        let camera = surface.renderer.camera;
        let actualScale = camera.zoomIn(span / this.previousSpan);
        let toFocusPoint = Vec2.fromPointToPoint(focus, this.previousFocus);
        toFocusPoint.divScalar(actualScale); // Adjust vector for change in zoom
        let actualOffset = camera.offset(toFocusPoint);
        // If any changes occurred
        if(actualScale !== 1 || !actualOffset.equalsScalar(0)){
            // Keep track of previous span and focus point
            this.previousSpan = span / actualScale; 
            this.previousFocus.x = focus.x + actualOffset.x;
            this.previousFocus.y = focus.y + actualOffset.y;
            // Show changes on surface
            camera.updateMatrix();
            surface.requestRender();
        }
    }
}

  