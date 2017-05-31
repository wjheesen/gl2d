import {Template} from'gulp-structify/template'
import {IPoint} from './point'
import {IVec2, Vec2} from './vec2'
import {IRect } from './rect'
import {IMat2d, ScaleToFit} from './mat2d';

export { ScaleToFit }

/**
 * A 3x3 matrix for 2d transformations. The bottom row is always ignored.
 */
class Mat3 extends Template<Float32Array>{
    /**
     * The first entry in the first column of this Mat3.
     */
    c1r1: number;
    /**
     * The second entry in the first column of this Mat3.
     */
    c1r2: number;
    /**
     * The third entry in the first column of this Mat3.
     */
    c1r3: number;
    /**
     * The first entry in the second column of this Mat3.
     */
    c2r1: number;
    /**
     * The second entry in the second column of this Mat3.
     */
    c2r2: number;
    /**
     * The third entry in the second column of this Mat3.
     */
    c2r3: number;
    /**
     * The first entry in the third column of this Mat3.
     */
    c3r1: number;
    /**
     * The second entry in the third column of this Mat3.
     */
    c3r2: number;
    /**
     * The third entry in the third column of this Mat3.
     */
    c3r3: number;

    /**
     * Computes the determinant of this Mat3.
     */
    determinant() {
        return IMat2d.determinant(this);
    }

    /**
     * Sets this matrix to the result of multiplying the specified matrices from left to right.
     * @param left the left hand matrix.
     * @param right the right hand matrix.
     * @param dst where to store the result.
     */
    setConcat(left: IMat2d, right: IMat2d){
        IMat2d.setConcat(this, left, right);
    }

    /**
     * Sets this Mat3 to the identity matrix.
     */
    setIdentity() {
        IMat2d.setIdentity(this);
    }

    /**
     * Sets this Mat3 to map src into dst using the specified scale to fit option.
     * @param src the source rectangle.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option.
     */
    setRectToRect(src: IRect, dst: IRect, stf: ScaleToFit) {
        IMat2d.setRectToRect(this, src, dst, stf);        
    }

    /**
     * Sets this Mat3 to rotate by the specified angle, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param radians the angle of the rotation in radians.
     * @param p the pivot point.
     */
    setRotate(radians: number, p?: IPoint) {
       IMat2d.setRotate(this, radians, p);
    }

    /**
     * Sets this Mat3 to rotate from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start the start point (before rotation).
     * @param end the end point (after rotation).
     * @param p the pivot point. Defaults to (0,0).
     */
    setRotateToPoint(start: IPoint, end: IPoint, p?: IPoint) {
       IMat2d.setRotateToPoint(this, end, p);
    }

    /**
     * Sets this Mat3 to rotate by the specified sin and cos values, with a pivot point at p.
     * @param sin the sine of the rotation angle.
     * @param cos the cosine of the rotation angle.
     * @param p the pivot point.
     */
    setSinCos(sin: number, cos: number, p?: IPoint){
        IMat2d.setSinCos(this, sin, cos, p);
    }

    /**
     * Sets this Mat3 to scale by the specified width and height ratios, with a pivot point at p.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     * @param p the pivot point.
     */
    setScale(sx: number, sy: number, p?: IPoint){
        IMat2d.setScale(this, sx, sy, p);
    }

    /**
     * Sets this Mat3 to scale from the specified start point to the specified end point, with a pivot point at p.
     * @param start the start point (before scale).
     * @param end the end point (after scale).
     * @param p the pivot point. Defaults to (0,0).
     */
    setScaleToPoint(start: IPoint, end: IPoint, p?: IPoint) {
        IMat2d.setScaleToPoint(this, start, end, p);
    }

    /**
     * Sets this Mat3 to stretch by the specified ratio, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param ratio the percentage by which to stretch in all directions.
     * @param p the pivot point.
     */
    setStretch(ratio: number, p?: IPoint) {
        IMat2d.setStretch(this, ratio, p);
    }

    /**
     * Sets this Mat3 to stretch from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start: the start point (before stretch).
     * @param end: the end point (after stretch).
     * @param p the pivot point. Defaults to (0,0).
     */
    setStretchToPoint(start: IPoint, end: IPoint, p?: IPoint) {
        IMat2d.setStretchToPoint(this, start, end, p);
    }

    /**
     * Sets this Mat3 to stretch rotate from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start the start point (before stretch rotation).
     * @param end the end point (after stretch rotation).
     * @param p the pivot point. Defaults to (0,0).
     */
    setStretchRotateToPoint(start: IPoint, end: IPoint, p?: IPoint) {
        IMat2d.setStretchRotateToPoint(this, start, end, p);
    }

    /**
     * Sets this Mat3 to translate by the specified vector.
     */
    setTranslate(vec: Vec2) {
        IMat2d.setTranslate(this, vec);
    }

    /**
     * Sets this Mat3 to translate by the vector (dx,dy).
     */
    setTranslate$(dx: number, dy: number) {
        IMat2d.setTranslate$(this, dx, dy);
    }

    /**
      * Sets this Mat3 to translate from the specified start point to the specified end point.
      * @param start the start point (before translation).
      * @param end the end point (after translation).
      */
    setTranslateToPoint(start: IPoint, end: IPoint) {
        IMat2d.setTranslateToPoint(this, start, end)
    }

    /**
     * Conjugates this Mat3 with a translation by the specified vector.
     */
    conjugateByTranslation(vec: Vec2) {
        IMat2d.conjugateByTranslation(this, vec);
    }

    /**
     * Conjugates this Mat3 with a translation by vector (dx,dy).
     * @param dx the vertical component of the translation vector.
     * @param dy the horizontal component of the translation vector.
     */
    conjugateByTranslation$(dx: number, dy: number) {
        IMat2d.conjugateByTranslation$(this, dx, dy);
    }

    /**
     * Sets this Mat3 to the inverse of the other Mat2d.
     */
    setInverse(other: IMat2d){
        IMat2d.setInverse(this, other);
    }

    /**
     * Post concats this Mat3 by the other Mat2d: this = other * this.
     */
    postConcat(other: IMat2d) {
        IMat2d.postConcat(this, other);
    }

    /**
     * Pre concats this Mat3 by the other Mat2d: this = this * other.
     */
    preConcat(other: IMat2d) {
        IMat2d.preConcat(this, other);
    }

    /**
     * Post concats this Mat3 with a rotation by the specified angle in radians.
     * @param radians the angle in radians.
     */
    postRotate(radians: number) {
        IMat2d.postRotate(this, radians);
    }

    /**
     * Pre concats this Mat3 with a rotation by the specified angle in radians.
     * @param radians the angle in radians.
     */
    preRotate(radians: number) {
       IMat2d.preRotate(this, radians);
    }

    /**
     * Post concats this Mat3 with a scale of the specified width and height ratios.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     */
    postScale(sx: number, sy: number) {
        IMat2d.postScale(this, sx, sy);
    }

    /**
     * Pre concats this Mat3 with a scale of the specified width and height ratios.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     */
    preScale(sx: number, sy: number) {
        IMat2d.preScale(this, sx, sy);
    }

    /**
     * Post concats this Mat3 with a stretch of the specified ratio.
     * @param ratio the percentage by whih to stretch all in directions.
     */
    postStretch(ratio: number) {
        IMat2d.postStretch(this, ratio);
    }

    /**
     * Pre concats this Mat3 with a stretch of the specified ratio.
     * @param ratio the percentage by which to stretch all in directions.
     */
    preStretch(ratio: number) {
        IMat2d.preStretch(this, ratio);
    }

    /**
     * Post concats this Mat3 with a translation by the specified vector.
     */
    postTranslate(vec: IVec2) {
        IMat2d.postTranslate(this, vec);
    }

    /**
     * Post concats this Mat3 with a translation by vector (dx,dy).
     */
    postTranslate$(dx: number, dy: number) {
        IMat2d.postTranslate$(this, dx, dy);
    }

    /**
     * Post concats this Mat3 with a translation by vector (dx,dy).
     */
    preTranslate(vec: Vec2) {
        IMat2d.preTranslate(this, vec);
    }

    /**
     * Post concats this Mat3 with a translation by vector (dx,dy).
     */
    preTranslate$(dx: number, dy: number) {
        IMat2d.preTranslate$(this, dx, dy);
    }

    /**
     * Maps the source point and writes the result into dst.
     * @param point the point to map.
     */
    map(src: IPoint, dst: IPoint) {
        IMat2d.map(this, src, dst);
    }

    /**
     * Maps the point (x,y) and writes the result into dst.
     * @param x the x coordinate of the point.
     * @param y the y coordinate of the point.
     */
    map$(x: number, y: number, dst: IPoint) {
        IMat2d.map$(this, x, y, dst);
    }

    /**
     * Maps a subset of points in the specified array.
     * @param src array of points to map.
     * @param srcOffset offset into src of the first point in the subset.
     * @param count the number of points to include.
     */
    mapPoints(src: IPoint[], srcOffset: number, count: number) {
        IMat2d.mapPoints(this, src, srcOffset, count);
    }

    /**
     * Maps a subset of points in the specified array.
     * @param src array of points written as a series of (x,y) coordinates.
     * @param srcOffset offset into src of the first point in the subset.
     * @param count the number of points to include.
     */
    mapPoints$(src: Float32Array, srcOffset: number, count: number) {
        IMat2d.mapPoints$(this, src, srcOffset, count);
    }

    /**
     * Maps the src rect and writes the result into dst.
     * @param src the source rectangle.
     * @param dst the destination rectangle. Defaults to src.
     */
    mapRect(src: IRect, dst: IRect) {
        IMat2d.mapRect(this, src, dst);
    }
}

