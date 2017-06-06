import { _ScrollAction } from '../action/scroll';
import { _ScrollTool } from './scroll';

/**
 * Tool for zooming in and out of a surface based on scroll events and cursor position.
 */
export class ScrollZoomTool implements _ScrollTool {

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

    onAction(action: _ScrollAction){
        let surface = action.target;
        let currentTime = Date.now();
        let timeEllapsed = currentTime - this.timeOfLastScale;
        if(timeEllapsed > this.minTimeElapse){
            let scaleFactor = action.isUpward ? this.scaleFactor : 1/this.scaleFactor;
            surface.zoomToPoint(scaleFactor, action.cursor);
            this.timeOfLastScale = currentTime;
        }
    }
}