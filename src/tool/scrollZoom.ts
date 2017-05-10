import { _ScrollAction } from '../action/scroll';
import { _ScrollTool } from './scroll';

export class ScrollZoomTool implements _ScrollTool {

    constructor(public scaleFactor: number){};

    onAction(action: _ScrollAction){
        let surface = action.target;
        if(!surface.hasRenderRequest){
            let scaleFactor = action.isUpward ? this.scaleFactor : 1/this.scaleFactor;
            surface.zoomToPoint(scaleFactor, action.cursor);
        }
    }
}