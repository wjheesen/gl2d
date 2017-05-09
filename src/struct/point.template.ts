import {Template} from'gulp-structify/template'

/**
 * Point with x and y coordinates.
 */
class Point extends Template<Float32Array>{

    /**
     * The X coordinate of this point.
     */
    x: number;

    /**
     * The Y coordinate of this point.
     */
    y: number;

    /**
     * Sets this point to the midpoint of p1 and p2.
     */
    setMidpoint(p1: Point, p2: Point) {
        this.x = 0.5 * (p1.x + p2.x);
        this.y = 0.5 * (p1.y + p2.y);
    }

    /**
     * Computes the distance between this point and the other point.
     * @param other defaults to origin.
     */
    distance(other?: Point) {
        return Math.sqrt(this.distance2(other));
    }

    /**
     * Computes the distance squared from this point to the other point.
     * @param other defaults to origin.
     */
    distance2(other?: Point) {
        let dx = other ? other.x - this.x : this.x;
        let dy = other ? other.y - this.y : this.y;
        return dx * dx + dy * dy;
    }
}





