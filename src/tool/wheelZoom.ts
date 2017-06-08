import { _SurfaceWheelEvent } from '../event/scroll';
import { _WheelTool } from './wheel';

/**
 * Tool for zooming in and out of a surface based on scroll events and cursor position.
 */
export class WheelZoomTool implements _WheelTool {

    /**
     * The scale applied to the surface when zooming in. The inverse is applied when zooming out.
     */
    scaleFactor: number;

    /**
     * The minimum number of milliseconds that must elapse between scroll events in order for the scale to be applied.
     */
    minTimeElapse: number;

    /**
     * The time of the last scale in milliseconds. 
     */
    timeOfLastScale = 0;

    /**
     * @param scaleFactor The scale applied to the surface whene scrolling in. The inverse is applied when scrolling out.
     * @param minTimeEllapse The minimum number of milliseconds that must elapse between scroll events in order for the scale to be applied.
     */
    constructor(scaleFactor: number, minTimeElapse: number){
        this.scaleFactor = scaleFactor;
        this.minTimeElapse = minTimeElapse;
    }

    onSurfaceEvent(event: _SurfaceWheelEvent){
        let surface = event.target;
        let currentTime = Date.now();
        let timeEllapsed = currentTime - this.timeOfLastScale;
        if(timeEllapsed > this.minTimeElapse){
            let scaleFactor = event.isUpward ? this.scaleFactor : 1/this.scaleFactor;
            surface.zoomToPoint(scaleFactor, event.cursor);
            this.timeOfLastScale = currentTime;
        }
    }
}