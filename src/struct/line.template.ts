import { PointLike } from './point';
import { Template } from 'gulp-structify/template';

/**
 * The line from (x1,y1) to (x2,y2).
 */
export class Line extends Template<Float32Array> {

    /**
     * The X coordinate of the point at the start of this Line.
     */
    x1: number;
    /**
     * The Y coordinate of the point at the start of this Line.
     */
    y1: number;
    /**
     * The X coordinate of the point at the end of this Line.
     */
    x2: number;
    /**
     * The Y coordinate of the point at the end of this Line.
     */
    y2: number;

    /**
     * Sets this line to the line from one point to another.
     */
    setFromPointToPoint(p1: PointLike, p2: PointLike) {
        this.x1 = p1.x;
        this.y1 = p1.y;
        this.x2 = p2.x;
        this.y2 = p2.y;
    }

    /**
     * Checks if the distance from this line to the specified point is less than epsilon.
     */
    contains(pt: PointLike, epsilon: number) {
        return this.contains$(pt.x, pt.y, epsilon);
    }

    /**
      * Checks if the distance from this line to (x,y) is less than epsilon.
      */
    contains$(x: number, y: number, epsilon: number) {
        // Paramaterize the line segment to a + bt, 0<=t<=1
        let ax = this.x1,
            ay = this.y1,
            bx = this.x2 - ax,
            by = this.y2 - ay,
            t = -1;

        // Set t to signed distance from a to proj(x,y), 
        // where proj(x,y) is the projection of (x,y) onto the line.
        let vx = x - ax, vy = y - ay;
        let dot = bx * vx + by * vy;
        let len2 = bx * bx + by * by;
        if (len2 != 0) { //in case of 0 length line
            t = dot / len2;
        }

        // If projection falls to left or right of line segment
        if (t < 0 || t > 1) {
            // Line does not contain point
            return false;
        }

        // Otherwise compute proj(x,y), the point
        // on the line segment that is nearest (x, y)
        let projX = ax + t * bx;
        let projY = ay + t * by;

        // Finally, compute the distance squared from (x,y) to proj(x,y)
        let dx = x - projX;
        let dy = y - projY;
        let dist2 = dx * dx + dy * dy;

        // The line segment contains the point if this distance
        // is less than epsilon squared.
        return dist2 < (epsilon * epsilon);
    }


}


