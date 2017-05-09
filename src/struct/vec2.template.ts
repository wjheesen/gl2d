import Template from 'gulp-structify/template'
import Point from './point';

/**
 * A two-dimensional vector with (x,y) components.
 */
class Vec2 extends Template<Float32Array> {

    /**
     * The X component of this Vec2.
     */
    x: number;

    /**
     * The Y component of this Vec2.
     */
    y: number;

    /**
     * Computes the length of this Vec2.
     */
    length(): number {
        return Math.sqrt(this.length2());
    }

    /**
     * Computes the length squared of this Vec2.
     */
    length2(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Sets this Vec2 to a vector from the initial point to the terminal point. 
     */
    setFromPointToPoint(initial: Point, terminal: Point) {
        this.x = terminal.x - initial.x;
        this.y = terminal.y - initial.y;
    }

    /**
     * Computes the dot product of this Vec2 with the other Vec2.
     */
    dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Computes the cross product of this Vec2 with the other Vec2.
     */
    cross(other: Vec2): number {
        return (this.x * other.y) - (other.x * this.y);
    }

    /**
     * Inverts this Vec2.
     */
    invert(){
        this.x = -this.x;
        this.y = -this.y;
    }

    /**
     * Normalizes this Vec2 so that it has a length of one.
     */
    normalize() {
        this.divScalar(this.length());
    }

    /**
     * Rotates this Vec2 90 degrees to the left (CCW).
     */
    rotateLeft() {
        let x = this.x;
        this.x = -this.y;
        this.y = x;
    }

    /**
     * Rotates this Vec2 90 degrees to the right (CW).
     */
    rotateRight() {
        let x = this.x;
        this.x = this.y;
        this.y = -x;
    }
}



