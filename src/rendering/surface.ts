import {Renderer} from './renderer'
import {IPoint, Point} from '../struct/point'
import {Vec2} from '../struct/vec2'
import {ScreenPoint} from '../action/screenpoint'
import {Status} from '../action/status'
import {MouseAction } from '../action/mouse';
import {TouchAction} from '../action/touch'
import {ScrollAction} from '../action/scroll'

/**
 * A rendering surface linked to an HTMLCanvasElement (the drawing buffer).
 */
export class Surface<R extends Renderer> {

    /**
     * The drawing buffer for this surface.
     */
    drawingBuffer: HTMLCanvasElement;

    /**
     * The drawing buffer's bounding client rect.
     */
    clientRect: ClientRect;

    /**
     * The renderer used to render this surface.
     */
    renderer: R;

    /**
     * True if a request has been made to re-render this surface.
     */
    hasRenderRequest = false;

    /**
     * Creates a new rendering surface.
     * @param drawingBuffer the canvas that serves as the drawing buffer for this surface.
     * @param renderer the renderer responsible for rendering the surface.
     */
    constructor(drawingBuffer: HTMLCanvasElement, renderer: R) {
        this.drawingBuffer = drawingBuffer;
        this.clientRect = drawingBuffer.getBoundingClientRect();
        this.renderer = renderer;
        this.renderer.onSurfaceCreated();
    }

    /**
     * Requests that this surface be re-rendered.
     */
    requestRender() {
        this.hasRenderRequest = true;
    }

    /**
     * Re-renders this surface if it has a render request.
     */
    onAnimationFrame(){
        if(this.hasRenderRequest){
            this.renderer.onDrawFrame();
            this.hasRenderRequest = false;
        }
    }

    /**
     * Resizes this surface if the specified width and height differ from the current width and height.
     * @param width the width to set on the surface. Defaults to the client width of the drawing buffer.
     * @param height the height to set on the surface. Defaults to the client height of the drawing buffer.
     */
    resize(width = this.drawingBuffer.clientWidth, height = this.drawingBuffer.clientHeight) {
        // If width or height has changed
        if (this.drawingBuffer.width !== width || this.drawingBuffer.height !== height) {
            // Resize canvas to specified dimensions
            this.drawingBuffer.width = width;
            this.drawingBuffer.height = height;
            // Get new bounding box
            this.clientRect = this.drawingBuffer.getBoundingClientRect();
            // Notify renderer of surface change
            this.renderer.onSurfaceChanged(width, height);
            // Request render to show changes
            this.requestRender();
        }
    }

    /**
     * Sends a request to offset the image displayed by this surface.
     * @param desiredOffset the desired offset, which is automatically adjusted according to the renderer's camera settings.
     * @returns the actual offset.
     */
    offset(desiredOffset: Vec2) {
        let camera = this.renderer.camera;
        let actual = camera.offset(desiredOffset);
        if(!actual.equalsScalar(0)){
            camera.updateMatrix();
            this.requestRender();
        }
        return actual;
    }

    /**
     * Sends a request to zoom into the image displayed by this surface.
     * @param desiredScaleFactor the desired scale factor, which is automatically adjusted according to the renderer's camera settings.
     * @returns the actual scale factor.
     */
    zoomIn(desiredScaleFactor: number){
        let camera = this.renderer.camera;
        let actual = camera.zoomIn(desiredScaleFactor);
        if(actual !== 1){
            camera.updateMatrix();
            this.requestRender();
        }
        return actual;
    }

    /**
     * Sends a request to zoom out of the image displayed by this surface.
     * @param desiredScaleFactor the desired scale factor, which is automatically adjusted according to the renderer's camera settings.
     * @returns the actual scale factor.
     */
    zoomOut(desiredScaleFactor: number){
        return this.zoomIn(1/desiredScaleFactor);
    }

    /**
     * Sends a request to zoom into the image displayed by this surface while fixing the specified focus point.
     * @param desiredScaleFactor the desired scale factor, which is automatically adjusted according to the renderer's camera settings.
     * @param focus the focus point. 
     * @returns the actual scale factor and camera offset.
     */
    zoomToPoint(desiredScaleFactor: number, focus: IPoint) {
        let camera = this.renderer.camera;
        let actual = camera.zoomToPoint(desiredScaleFactor, focus);
        if(actual.scaleFactor !== 1 || !actual.offset.equalsScalar(0)){
            camera.updateMatrix();
            this.requestRender();
        }
        return actual;
    }

    /**
     * Maps a screen cordinate  to canvas space.
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToCanvas(screenPoint: ScreenPoint, dst: IPoint = new Point()) {
        dst.x = screenPoint.clientX - this.clientRect.left;
        dst.y = screenPoint.clientY - this.clientRect.top;
        return dst;
    }

    /**
     * Maps a screen coordinate to NDC space [0,1].
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToNdc(screenPoint: ScreenPoint, dst: IPoint = new Point()) {
        this.screenToCanvas(screenPoint, dst);
        this.canvasToNdc(dst, dst);
        return dst;
    }

    /**
     * Maps a screen coordinate to clip space.
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToWorld(screenPoint: ScreenPoint, dst: IPoint = new Point()) {
        this.screenToCanvas(screenPoint, dst);
        this.canvasToNdc(dst, dst);
        this.ndcToWorld(dst, dst);
        return dst;
    }

    /**
     * Maps a canvas coordinate to NDC space [0,1].
     * @param p the canvas coordinate.
     * @param dst where to store the result.
     */
    canvasToNdc(canvasPoint: IPoint, dst: IPoint = new Point()) {
        // Normalize the coordinate by width and height of canvas
        let width = this.clientRect.width;
        let height = this.clientRect.height;
        dst.x = canvasPoint.x / width;
        dst.y = (height - canvasPoint.y) / height; // Flip in y axis
        return dst;
    }

    /**
     * Maps a normalized device coordinate (NDC) to world space.
     * @param p the normalized device coordinate.
     * @param dst where to store the result.
     */
    ndcToWorld(ndc: IPoint, dst: IPoint = new Point()) {
        // Depends on what is currently in view
        let view = this.renderer.camera.view;
        dst.x = view.left + (ndc.x * view.width());
        dst.y = view.bottom + (ndc.y * view.height());
        return dst;
    }
    
    /**
     * Invokes the specified callback whenever a mouse action occurs on this surface.
     */
    onMouseAction(callback: (action: MouseAction<this>) => void){
        /**
         * Whether or not a mouse button is currently pressed.
         */
        let isPressed = false;

        // Listen for mouse events
        window.addEventListener("mousedown", e => {
            // Return if not inside element
            if (e.target !== this.drawingBuffer) return;
            // A mouse button is pressed
            isPressed = true;
            // Tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.Start));
        }, false);
        window.addEventListener("mousemove", e => {
            // If mouse is pressed
            if (isPressed) {
                // Tell browser we're handling this event
                e.preventDefault();
                e.stopPropagation();
                // Process as a drag action
                callback(this.getMouseAction(e, Status.Drag));
            } else {
                // Otherwise process as a move action
                callback(this.getMouseAction(e, Status.Move));
            }
        }, false);
        window.addEventListener("mouseout", e => {
            // Ignore if mouse not pressed
            if (!isPressed) { return; } 
            // Tell browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.Leave));
        }, false);
        window.addEventListener("mouseup", e => {
            // Ignore if mouse not pressed
            if (!isPressed) { return; } 
            // Mouse is no longer pressed
            isPressed = false;
            // Tell browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.End));
        }, false);
    }

    private getMouseAction(event: MouseEvent, status: Status): MouseAction<this> {
        return {
            target: this,
            src: event,
            status: status,
            cursor: this.screenToWorld(event)
        }
    }

    /**
     * Invokes the specified callback whenever a touch action occurs on this surface.
     */
    onTouchAction(callback: (action: TouchAction<this>) => void){

        /**
         * Whether or no a touch event is currently active.
         */
        let isActive = false;

        // Listen for touch events
        window.addEventListener("touchstart", (e: TouchEvent) => {
            // Return if not inside element
            if (e.target !== this.drawingBuffer) return;
            // Mark touch event active
            isActive = true;
            // Tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Start));
        }, false);
        window.addEventListener("touchmove", (e: TouchEvent) => {
            // Don't send callback if touch action did not originate inside the element
            if (!isActive) return;
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Drag));
        }, false);
        window.addEventListener("touchleave", (e: TouchEvent) => {
            // Don't send callback if touch action did not originate inside the element
            if (!isActive) return;
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Leave));
        }, false);
        window.addEventListener("touchend", (e: TouchEvent) => {
            // Don't send callback if touch action did not originate inside the element
            if (!isActive) return;
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.End));
        }, false);
    }

    private getTouchAction(event: TouchEvent, status: Status): TouchAction<this> {
        return {
            target: this,
            src: event,
            status: status,
            pointers: this.getPointers(event)
        }
    }

    private getPointers(event: TouchEvent) {
        let pointers: IPoint[] = [];
        let touches = event.touches;
        // Convert each of the touches to world space and add to array
        for (let i = 0; i < touches.length; i++) {
            pointers[i] = this.screenToWorld(touches[i]);
        }
        return pointers;
    }

    /**
     * Invokes the specified callback whenever a scroll action occurs on this surface.
     */
    onScrollAction(callback: (action: ScrollAction<this>) => void) {
        document.addEventListener(this.getScrollSupport(), (e: WheelEvent | MouseWheelEvent) => {
            if(e.target === this.drawingBuffer){
                e.preventDefault();
                e.stopPropagation();
                let isUpward = e.deltaY < 0 || e.detail < 0 || e.wheelDelta > 0;
                callback({ isUpward: isUpward, cursor: this.screenToWorld(e), target: this, src: e });
            }
        })
    }

    /**
     * From https://developer.mozilla.org/en-US/docs/Web/Events/wheel
     */
    private getScrollSupport(){
         return "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
    }

};

export type _Surface = Surface<Renderer>;