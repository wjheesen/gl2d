import {Renderer} from './renderer'
import {Point} from '../struct/point'
import {Rect} from '../struct/rect'
import {ScreenPoint} from '../action/screenpoint'
import {Status} from '../action/status'
import {MouseAction} from '../action/mouse'
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
     * Maps a screen cordinate  to canvas space.
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToCanvas(screenPoint: ScreenPoint, dst: Point = new Point.Obj()) {
        dst.x = screenPoint.clientX - this.clientRect.left;
        dst.y = screenPoint.clientY - this.clientRect.top;
        return dst;
    }

    /**
     * Maps a screen coordinate to NDC space [0,1].
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToNdc(screenPoint: ScreenPoint, dst: Point = new Point.Obj()) {
        this.screenToCanvas(screenPoint, dst);
        this.canvasToNdc(dst, dst);
        return dst;
    }

    /**
     * Maps a screen coordinate to clip space.
     * @param screen the screen coordinate.
     * @param dst where to store the result.
     */
    screenToWorld(screenPoint: ScreenPoint, dst: Point = new Point.Obj()) {
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
    canvasToNdc(canvasPoint: Point, dst: Point = new Point.Obj()) {
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
    ndcToWorld(ndc: Point, dst: Point = new Point.Obj()) {
        // Depends on what is currently in view
        let view = this.renderer.camera.view;
        dst.x = view.left + (ndc.x * Rect.width(view));
        dst.y = view.bottom + (ndc.y * Rect.height(view));
        return dst;
    }
    
    /**
     * Invokes the specified callback whenever a mouse action occurs on this surface.
     */
    onMouseAction(callback: (action: MouseAction) => void){
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
            // return if no mouse button pressed
            if (!isPressed) { return; }
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.Move));
        }, false);
        window.addEventListener("mouseout", e => {
            // return if no mouse button pressed
            if (!isPressed) { return; }
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.Leave));
        }, false);
        window.addEventListener("mouseup", e => {
            // return if no mouse button pressed
            if (!isPressed) { return; }
            // tell the browser we're handling this event
            e.preventDefault();
            e.stopPropagation();
            // The mouse button is no longer pressed
            isPressed = false;
            // Get action and pass to callback
            callback(this.getMouseAction(e, Status.End));
        }, false);
    }

    private getMouseAction(event: MouseEvent, status: Status): MouseAction {
        return {
            src: event,
            status: status,
            cursor: this.screenToWorld(event)
        }
    }

    /**
     * Invokes the specified callback whenever a touch action occurs on this surface.
     */
    onTouchAction(callback: (action: TouchAction) => void){
        /**
         * Whether or not a pointer is currently touching the screen.
         */
        let isTouching = false;
        // TODO: send callback even if not touching, make note in action

        // Listen for touch events
        window.addEventListener("touchstart", (e: TouchEvent) => {
            // Return if not inside element
            if (e.target !== this.drawingBuffer) return;
            // A pointer is currently touching the screen
            isTouching = true;
            // Tell the browser we're handling this event
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Start));
        }, false);
        window.addEventListener("touchmove", (e: TouchEvent) => {
            // return if we're not dragging
            if (!isTouching) { return; }
            // tell the browser we're handling this event
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Move));
        }, false);
        window.addEventListener("touchleave", (e: TouchEvent) => {
            // return if we're not dragging
            if (!isTouching) { return; }
            // tell the browser we're handling this event
            e.stopPropagation();
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.Leave));
        }, false);
        window.addEventListener("touchend", (e: TouchEvent) => {
            // return if we're not dragging
            if (!isTouching) { return; }
            // tell the browser we're handling this event
            e.stopPropagation();
            // No pointer is currently touching the screen
            isTouching = false;
            // Get action and pass to callback
            callback(this.getTouchAction(e, Status.End));
        }, false);
    }

    private getTouchAction(event: TouchEvent, status: Status): TouchAction {
        return {
            src: event,
            status: status,
            pointers: this.getPointers(event)
        }
    }

    private getPointers(event: TouchEvent) {
        // Create empty pointers array
        let pointers: Point[] = [];
        // Get the array of touches
        let touches = event.touches;
        // Convert each of the touches to world space and add to array
        for (let i = 0; i < touches.length; i++) {
            pointers[i] = this.screenToWorld(touches[i]);
        }
        // Return the array of pointers
        return pointers;
    }

    /**
     * Invokes the specified callback whenever a scroll action occurs on this surface.
     */
    onScrollAction(callback: (action: ScrollAction) => void) {
        document.addEventListener(this.getScrollSupport(), (e: WheelEvent | MouseWheelEvent) => {
            if(e.target === this.drawingBuffer){
                let isUpward = e.deltaY < 0 || e.detail < 0 || e.wheelDelta > 0;
                callback({ isUpward: isUpward, cursor: this.screenToWorld(e), src: e });
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