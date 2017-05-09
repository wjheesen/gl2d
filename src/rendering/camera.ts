import {Point} from '../struct/point';
import {Vec2} from '../struct/vec2';
import {Rect} from '../struct/rect';
import {Mat4} from '../struct/mat4'

/**
 * Defines an orthographic projection from target space to clip space.
 */
export class Camera {

    /**
     * The area this camera is targeting.
     */
    target: Rect.Obj;
    /**
     * The area of the target that is currently in view.
     */
    view = new Rect.Obj();

    /**
     * The orthographic projection matrix that puts the target in view.
     */
    matrix = new Mat4.Struct();

    /**
     * The current position of the camera in relation to the center of the target.
     */
    position = new Vec2.Obj();

    /**
     * The current zoom setting for this camera.
     */
    zoom = 1;

    /**
     * The minimum zoom setting for this camera.
     */
    minZoom: number;

    /**
     * The maximum zoom setting for this camera.
     */
    maxZoom: number;

    /**
     * Creates a camera restricted to the specified target area, and by the min/max zoom values.
     * @param target the area this camera is targeting. 
     * @param minZoom the minimum zoom for the camera.
     * @param maxZoom the maximum zoom for the camera.
     */
    constructor(target: Rect.Obj, minZoom: number, maxZoom: number){
        this.target = target;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
    }

    /**
     * Sets the size of the viewport in which the camera image will be displayed.
     * The resulting image will be centered inside the viewport and will match the aspect of the camera's target. 
     * @param vw the new width of the viewport.
     * @param vh the new height of the viewport.
     */
    setViewport(vw: number, vh: number) {
        // Destructure
        let {target, view } = this;
        // Clear camera settings
        view.set(target);
        // Compute width and height of target
        let ww = target.width();
        let wh = target.height();
        // Compute width to height ratio of viewport and target
        let vr = vw / vh;
        let wr = ww / wh;
        // If viewport width ratio less than canvas width ratio
        if (wr < vr) {
            // Increase width so that ratios are equal
            view.scale(vr / wr, 1);
        } else {
            // Otherwise increase height so that ratios are equal
            view.scale(1, wr / vr);
        }
        // Restore camera settings
        view.stretch(1 / this.zoom);
        view.offset(this.position);
        // Update matrix to reflect changes
        this.updateMatrix();
    }

    /**
     * Sends a request to offset this camera by the desired vector.
     * Note: the desired offset may be adjusted to keep the camera from viewing anything outside of the target area.
     * @param desired the desired offset. 
     * @returns the actual offset.
     */
    offset(desiredOffset: Vec2) {
        // Compute the target position
        let targetPosition = Vec2.Obj.create(this.position);
        targetPosition.add(desiredOffset);

        // Determine how far we can position the camera away from the origin
        let far = Rect.Obj.create(this.target);                // Copy target boundaries
        far.mulScalar((this.zoom - this.minZoom) / this.zoom); // Determine max allowable size given zoom
        far.offset$(-far.centerX(), -far.centerY());           // Center at origin so we know how far left, up, right, and down we can go

        let actualOffset = Vec2.Obj.create(desiredOffset);
        // If target position is too far left
        if (targetPosition.x < far.left) {
            // Adjust offset so that offset.x + position.x = far.left
            actualOffset.x = far.left - this.position.x;
        }
        // If target position is too far right
        else if (targetPosition.x > far.right) {
            // Adjust offset so that offset.x + position.x = far.right
            actualOffset.x = far.right - this.position.x;
        }
        // If target position is too far down
        if (targetPosition.y < far.bottom) {
            // Adjust offset so that offset.y + position.y = far.bottom
            actualOffset.y = far.bottom - this.position.y;
        }
        // If target position is too far up
        else if (targetPosition.y > far.top) {
            // Adjust offset so that offset.y + position.y = far.top
            actualOffset.y = far.top - this.position.y;
        }

        // Now we can safely apply offset to our projection region
        this.view.offset(actualOffset);

        // And update our position variable accordingly
        this.position.add(actualOffset);

        // Return actual offset so caller can check if it differs from desired
        return actualOffset;
    }

    /**
     * Sends a request to zoom in this camera by the desired scale factor.
     * Note: the desired scale factor is automatically adjusted to keep the camera from viewing anything outside of the target area. 
     * @param desired the desired scale factor.
     * @returns the actual scale factor.
     */
    zoomIn(desiredScaleFactor: number) {
        // Compute the target zoom
        let targetZoom = this.zoom * desiredScaleFactor;
        let actualScaleFactor = desiredScaleFactor;
        // If target zoom falls below our min
        if (targetZoom < this.minZoom) {
            // Adjust scale factor so that zoom * changeInZoom = minZoom
            actualScaleFactor = this.minZoom / this.zoom;
            // Set zoom to min allowable
            this.zoom = this.minZoom;
            // Otherwise, if traget zoom is above our max
        } else if (targetZoom > this.maxZoom) {
            // Adjust scale factor so that zoom * changeInZoom = maxZoom
            actualScaleFactor = this.maxZoom / this.zoom;
            // Set zoom to max allowable
            this.zoom = this.maxZoom;
        } else {
            // Otherwise we can safely set zoom to our target
            this.zoom = targetZoom;
        }
        // Now we can safely apply scale factor to our projection region
        this.view.stretch(1 / desiredScaleFactor);
        // Return actual scale factor so caller can check if it differs from desired
        return actualScaleFactor;
    }

    /**
     * Sends a request to zoom out this camera by the desired scale factor.
     * Note: the desired scale factor is automatically adjusted to keep the camera from viewing anything outside of the target area. 
     * @param desired the desired scale factor.
     * @returns the actual scale factor.
     */
    zoomOut(desiredScaleFactor: number){
        return this.zoomIn(1/desiredScaleFactor);
    }

    /**
     * Sends a request to zoom this camera by the desired scale factor.
     * Note: the desired scale factor is automatically adjusted to keep the camera from viewing anything outside of the target area. 
     * @param desired the desired scale factor.
     * @param focus the focus point. 
     * @returns the actual scale factor and offset.
     */
    zoomToPoint(desiredScaleFactor: number, focus: Point) {
        let view = this.view;
        // Convert (x,y) coordinates to [0,1] space
        let normX = (focus.x - view.left) / Rect.width(view);
        let normY = (focus.y - view.bottom) / Rect.height(view);
        // Apply scale factor
        let actualScaleFactor = this.zoomIn(desiredScaleFactor);
        // Determine position of focus point after change in zoom
        let aft = new Vec2.Obj();
        aft.x = view.left + (normX * Rect.width(view));
        aft.y = view.bottom + (normY * Rect.height(view));
        // Compute offset back to focus point
        let offset = Vec2.Obj.fromPointToPoint(aft, focus);
        // Apply the offset
        let actualOffset = this.offset(offset);
        // Return actual scale factor and offset so caller can check if they differ from desired
        return {scaleFactor: actualScaleFactor, offset: actualOffset};
    }

    /**
     * Recalculates the projection matrix to reflect changes in the camera settings.
     */
    updateMatrix() {
        this.matrix.ortho(this.view, 0.1, 10)
    }
}