import { Vec2 } from '../struct/vec2';
import { Status } from '../event/status';
import { _SurfaceTouchEvent } from '../event/touch';
import { _TouchTool } from './touch';
import { IPoint, Point } from "../struct/point";

export class PinchZoomTool implements _TouchTool {

    private previousSpan: number;
    private previousFocus: IPoint;

    onSurfaceEvent(event: _SurfaceTouchEvent): void {
        // Check two pointers are down
        if(event.pointers.length < 2){
            return;
        }
        // Check previous focus point is set
        if(!this.previousFocus){
            return this.onStart(event);
        } 
        // Delegate based on status of action
        switch(event.status){
            case Status.Start:
                return this.onStart(event);
            case Status.Drag:
                return this.onDrag(event);
            case Status.End:
                this.previousFocus = null;
        }
    }

    onStart(event: _SurfaceTouchEvent) {
        let p1 = event.pointers[0];
        let p2 = event.pointers[1];
        this.previousSpan = IPoint.distance(p1, p2);
        this.previousFocus = Point.midpoint(p1, p2);
    }

    onDrag(event: _SurfaceTouchEvent) {
        let p1 = event.pointers[0];
        let p2 = event.pointers[1];
        let span = IPoint.distance(p1, p2);
        let focus = Point.midpoint(p1, p2);
        let surface = event.target;
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

  