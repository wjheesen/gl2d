import { PointLike } from './point';
import { Rect } from './rect';
import { Template } from 'gulp-structify/template';

 /**
  * Ellipse with semi axes (rx,ry) centered at the point (cx,cy).
  */
export class Ellipse extends Template<Float32Array> {
    /**
     * The semi x axis of this ellipse, that is, the distance from the center of this ellipse to its left and right vertices.
     */
    rx: number;
    /**
     * The semi y axis of this ellipse, that is, the distance from the center of this ellipse to its top and bottom vertices.
     */
    ry: number;
    /**
     * The X coordinate of the point at the center of this ellipse.
     */
    cx: number;
    /**
     * The Y coordinate of the point at the center of this ellipse.
     */
    cy: number;

    /**
     * Sets this ellipse to an ellipse bounded by the specified rect.
     */
    setFromRect(bounds: Rect) {
        this.rx = bounds.width() / 2;
        this.ry = bounds.height() / 2;
        this.cx = bounds.centerX();
        this.cy = bounds.centerY();
    }

    /**
     * Checks if this ellipse contains the specified point.
     * @param pt the point to check.
     */
    contains(pt: PointLike) {
        return this.contains$(pt.x, pt.y);
    }

    /**
     * Checks if this ellipse contains the point (x,y).
     * @param x the x coordinate of the point.
     * @param y the y coordinate of the point.
     */
    contains$(x: number, y: number) {
        // Compute vector <dx,dy> from point to center of ellipse
        let dx = this.cx - x;
        let dy = this.cy - y;
        // Normalize vector according to semi x and semi y axes
        let sx = dx / this.rx;
        let sy = dy / this.ry;
        // At this point we've reduced the problem to point in circle:
        return (sx * sx) + (sy * sy) <= 1;
    }
}