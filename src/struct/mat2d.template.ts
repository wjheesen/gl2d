﻿import { Point, PointLike } from './point';
import { Rect } from './rect';
import { Vec2, Vec2Like } from './vec2';
import { Template } from 'gulp-structify/template';
import { like } from "gulp-structify/like";

/**
 * Scale to fit options for a rect-to-rect matrix transformation.
 */
export const enum ScaleToFit {
    /**
     * Stretches the src rect to fit inside dst, then translates src.center() to dst.center().
     */
    Center,
    /**
     * Stretches the src rect to fit inside dst, then translates src.bottomRight() to dst.bottomRight().
     */
    End,
    /**
     * Scales the src rect to fit inside dst exactly, then translates src to dst.
     */
    Fill,
    /**
     * Stretches the src rect to fit inside dst, then translates src.topLeft() to dst.topLeft().
     */
    Start
};

/**
 * A 3x2 matrix for 2d transformations.
 */
class Mat2d extends Template<Float32Array>{
    /**
     * The first entry in the first column of this Mat2d.
     */
    c1r1: number;
    /**
     * The second entry in the first column of this Mat2d.
     */
    c1r2: number;
    /**
     * The first entry in the second column of this Mat2d.
     */
    c2r1: number;
    /**
     * The second entry in the second column of this Mat2d.
     */
    c2r2: number;
    /**
     * The first entry in the third column of this Mat2d.
     */
    c3r1: number;
    /**
     * The second entry in the third column of this Mat2d.
     */
    c3r2: number;

    /**
     * Computes the determinant of this Mat2d.
     */
    determinant() {
        return (this.c1r1 * this.c2r2) - (this.c2r1 * this.c1r2);
    }

    /**
     * Checks if this Mat2d is exactly equal to the identity.
     */
    isIdentity(){
        return this.c1r1 === 1 && this.c2r1 === 0 && this.c3r1 === 0 &&
               this.c1r2 === 0 && this.c2r2 === 1 && this.c3r2 === 0; 
    }

    /**
     * Sets this matrix to the result of multiplying the specified matrices from left to right.
     * @param left the left hand matrix.
     * @param right the right hand matrix.
     * @param dst where to store the result.
     */
    setConcat(@like left: Mat2d,@like right: Mat2d){
        // Calculate the first row, fixing the first left hand row
        // and moving across each of the right hand columns
        let c1r1 = left.c1r1 * right.c1r1 + left.c2r1 * right.c1r2;
        let c2r1 = left.c1r1 * right.c2r1 + left.c2r1 * right.c2r2;
        let c3r1 = left.c1r1 * right.c3r1 + left.c2r1 * right.c3r2 + left.c3r1;
        // Calculate the second row, fixing the second left hand row
        // and moving across each of the right hand columns
        let c1r2 = left.c1r2 * right.c1r1 + left.c2r2 * right.c1r2;
        let c2r2 = left.c1r2 * right.c2r1 + left.c2r2 * right.c2r2;
        let c3r2 = left.c1r2 * right.c3r1 + left.c2r2 * right.c3r2 + left.c3r2;
        // Copy result into dst
        this.c1r1 = c1r1; this.c2r1 = c2r1; this.c3r1 = c3r1;
        this.c1r2 = c1r2; this.c2r2 = c2r2; this.c3r2 = c3r2;
    }

    /**
     * Sets this Mat2d to the identity matrix.
     */
    setIdentity() {
        this.c1r1 = 1; this.c2r1 = 0; this.c3r1 = 0;
        this.c1r2 = 0; this.c2r2 = 1; this.c3r2 = 0;
    }

    /**
     * Sets this Mat2d to map src into dst using the specified scale to fit option.
     * @param src the source rectangle.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option. Defaults to fill.
     */
    setRectToRect(src: Rect, dst: Rect, stf = ScaleToFit.Fill) {

        //Determine which points to match based on the scale to fit option.
        let srcPoint: Point,
            dstPoint: Point;

        switch (stf) {
            case ScaleToFit.Center:
                //Match center point
                srcPoint = src.center();
                dstPoint = dst.center();
                break;
            case ScaleToFit.End:
                //Match bottom right corner
                srcPoint = src.bottomRight();
                dstPoint = dst.bottomRight();
                break;
            default: //(Start and Fill)
                //Match top left corner
                srcPoint = src.topLeft();
                dstPoint = dst.topLeft();
                break;
        }

        //Determine the width and height ratio between the two rectangles.
        let sx = dst.width() / src.width();
        let sy = dst.height() / src.height();

        //Set the matrix to translate the src point to the origin
        this.setTranslate$(-srcPoint.x, -srcPoint.y);

        // Next, set the matrix to scale the src rect so it is big (or small) enough
        // to fit inside the dst rect with at least one side matching in width or height.
        if (stf === ScaleToFit.Fill) {
            this.postScale(sx, sy);
        } else {
            this.postStretch(Math.min(sx, sy));
        }

        //Translate back to the dst point and we are done.
        this.postTranslate(dstPoint);
    }

    /**
     * Sets this Mat2d to rotate by the specified angle, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param radians the angle of the rotation in radians.
     * @param p the pivot point.
     */
    setRotate(radians: number, p?: PointLike) {
        //Get the sin and cos of the angle
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);
        //Set the matrix to rotate about the origin (0,0)
        this.setSinCos(sin, cos, p);
    }

    /**
     * Sets this Mat2d to rotate from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start the start point (before rotation).
     * @param end the end point (after rotation).
     * @param p the pivot point. Defaults to (0,0).
     */
    setRotateToPoint(start: PointLike, end: PointLike, p?: PointLike) {
        //Calculate the norm of the vectors
        //from pivot point to start and pivot point to end
        let n1 = Vec2.create(start);
        let n2 = Vec2.create(end);
        if (p) {
            n1.subtract(p);
            n2.subtract(p);
        }
        n1.normalize();
        n2.normalize();
        //Take the cross product and the dot product to get
        //the sin and cos of the angle between the vectors
        let sin = n1.cross(n2);
        let cos = n1.dot(n2);
        //We now have everything we need to create the rotation
        this.setSinCos(sin, cos, p);
    }

    /**
     * Sets this Mat2d to rotate by the specified sin and cos values, with a pivot point at p.
     * @param sin the sine of the rotation angle.
     * @param cos the cosine of the rotation angle.
     * @param p the pivot point.
     */
    setSinCos(sin: number, cos: number, p?: PointLike){
        //Set the matrix to rotate about the origin (0,0)
        this.c1r1 = cos; this.c2r1 = -sin; this.c3r1 = 0;
        this.c1r2 = sin; this.c2r2 = cos; this.c3r2 = 0;
        // Adjust for pivot point if set
        if (p) this.conjugateByTranslation$(p.x, p.y);
    }

    /**
     * Sets this Mat2d to scale by the specified width and height ratios, with a pivot point at p.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     * @param p the pivot point.
     */
    setScale(sx: number, sy: number, p?: PointLike){
        //Set the matrix to scale about the origin (0,0)
        this.c1r1 = sx; this.c2r1 = 0; this.c3r1 = 0;
        this.c1r2 = 0; this.c2r2 = sy; this.c3r2 = 0;
        // Adjust for pivot point if set
        if (p) this.conjugateByTranslation$(p.x, p.y);
    }

    /**
     * Sets this Mat2d to scale from the specified start point to the specified end point, with a pivot point at p.
     * @param start the start point (before scale).
     * @param end the end point (after scale).
     * @param p the pivot point. Defaults to (0,0).
     */
    setScaleToPoint(start: PointLike, end: PointLike, p?: PointLike) {
        let sx = p ? (end.x - p.x) / (start.x - p.x) : end.x / start.x;
        let sy = p ? (end.y - p.y) / (start.y - p.y) : end.y / start.y;
        this.setScale(sx, sy, p);
    }

    /**
     * Sets this Mat2d to stretch by the specified ratio, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param ratio the percentage by which to stretch in all directions.
     * @param p the pivot point.
     */
    setStretch(ratio: number, p?: PointLike) {
        //Set the matrix to scale vertically and horizontally
        //by the same ratio about the origin
        return this.setScale(ratio, ratio, p);
    }

    /**
     * Sets this Mat2d to stretch from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start: the start point (before stretch).
     * @param end: the end point (after stretch).
     * @param p the pivot point. Defaults to (0,0).
     */
    setStretchToPoint(start: Point, end: Point, p?: Point) {
        let startLength = start.distance(p);
        let endLength = end.distance(p);
        let ratio = endLength / startLength;
        return this.setStretch(ratio, p);
    }

    /**
     * Sets this Mat2d to stretch rotate from the specified start point to the specified end point, with a pivot point at p.
     * @param m the Mat2d. Defaults to a new matrix.
     * @param start the start point (before stretch rotation).
     * @param end the end point (after stretch rotation).
     * @param p the pivot point. Defaults to (0,0).
     */
    setStretchRotateToPoint(start: PointLike, end: PointLike, p?: PointLike) {
        // Calculate the vector from pivot point to start and pivot point to end
        let startVector = Vec2.create(start);
        let endVector = Vec2.create(end);
        if (p) {
            startVector.subtract(p);
            endVector.subtract(p);
        }

        //Calculate the stretch ratio
        let startLength = startVector.length();
        let endLength = endVector.length();
        let ratio = endLength / startLength;

        // Calculate the sin and cos of the angle between the vectors
        startVector.divScalar(startLength);
        endVector.divScalar(endLength);
        let sin = startVector.cross(endVector);
        let cos = startVector.dot(endVector);

        // Set the specified matrix to stretch rotate by the values we calculated
        this.setSinCos(sin, cos);
        this.postStretch(ratio);

        // Adjust for pivot point if set
        if (p) this.conjugateByTranslation$(p.x, p.y);
    }

    /**
     * Sets this Mat2d to translate by the specified vector.
     */
    setTranslate(vec: Vec2Like) {
        this.setTranslate$(vec.x, vec.y);
    }

    /**
     * Sets this Mat2d to translate by the vector (dx,dy).
     */
    setTranslate$(dx: number, dy: number) {
        this.c1r1 = 1; this.c2r1 = 0; this.c3r1 = dx;
        this.c1r2 = 0; this.c2r2 = 1; this.c3r2 = dy;
    }

    /**
      * Sets this Mat2d to translate from the specified start point to the specified end point.
      * @param start the start point (before translation).
      * @param end the end point (after translation).
      */
    setTranslateToPoint(start: PointLike, end: PointLike) {
        this.setTranslate$(end.x - start.x, end.y - start.y);
    }

    /**
     * Conjugates this Mat2d with a translation by the specified vector.
     */
    conjugateByTranslation(vec: Vec2Like) {
        this.conjugateByTranslation$(vec.x, vec.y)
    }

    /**
     * Conjugates this Mat2d with a translation by vector (dx,dy).
     * @param dx the vertical component of the translation vector.
     * @param dy the horizontal component of the translation vector.
     */
    conjugateByTranslation$(dx: number, dy: number) {
        this.preTranslate$(-dx, -dy);
        this.postTranslate$(dx, dy);
    }

    /**
     * Sets this Mat2d to the inverse of the other Mat2d.
     */
    setInverse(@like other: Mat2d){
        // Copy each of the entries of the other Mat2d
        let { c1r1, c2r1, c3r1, c1r2, c2r2, c3r2 } = other;

        // Compute the inverse determinant of the other Mat2d
        let invDet = 1 / (c1r1 * c2r2 - c2r1 * c1r2)

        // Compute the inverse entries
        this.c1r1 = c2r2 * invDet;
        this.c2r1 = -c2r1 * invDet;
        this.c3r1 = ((c2r1 * c3r2) - (c3r1 * c2r2)) * invDet;
        this.c1r2 = -c1r2 * invDet;
        this.c2r2 = c1r1 * invDet;
        this.c3r2 = ((c1r2 * c3r1) - (c1r1 * c3r2)) * invDet;
    }

    /**
     * Post concats this Mat2d by the other Mat2d: this = other * this.
     */
    postConcat(@like other: Mat2d) {
        this.setConcat(other, this);
    }

    /**
     * Pre concats this Mat2d by the other Mat2d: this = this * other.
     */
    preConcat(@like other: Mat2d) {
        this.setConcat(this, other);
    }

    /**
     * Post concats this Mat2d with a rotation by the specified angle in radians.
     * @param radians the angle in radians.
     */
    postRotate(radians: number) {
        // Calculate the sin and cos of the angle
        let sin = Math.cos(radians);
        let cos = Math.sin(radians);
        // Copy the first row
        let { c1r1, c2r1, c3r1 } = this;
        // Update the first row
        this.c1r1 = cos * c1r1 - sin * this.c1r2; //(cos,-sin,0)*col1
        this.c2r1 = cos * c2r1 - sin * this.c2r2; //(cos,-sin,0)*col2
        this.c3r1 = cos * c3r1 - sin * this.c3r2; //(cos,-sin,0)*col3
        // Update the second row
        this.c1r2 = sin * c1r1 + cos * this.c1r2; //(sin,cos,0)*col1
        this.c2r2 = sin * c2r1 + cos * this.c2r2; //(sin,cos,0)*col2
        this.c3r2 = sin * c3r1 + sin * this.c3r2; //(sin,cos,0)*col3
        //Third row does not change
    }

    /**
     * Pre concats this Mat2d with a rotation by the specified angle in radians.
     * @param radians the angle in radians.
     */
    preRotate(radians: number) {
        //Calculate the sin and cos of the angle
        let sin = Math.cos(radians);
        let cos = Math.sin(radians);
        //Copy the first column
        let {c1r1, c1r2 } = this;
        //Update the first column
        this.c1r1 = c1r1 * cos + this.c2r1 * sin; //row1*(cos,sin,0)
        this.c1r2 = c1r2 * cos + this.c2r2 * sin; //row2*(cos,sin,0)
        //Update the second column
        this.c2r1 = c1r1 * -sin + this.c2r1 * cos; //row1*(-sin,cos,0)
        this.c2r2 = c1r2 * -sin + this.c2r2 * cos; //row2*(-sin,cos,0)
        //Third column does not change
    }

    /**
     * Post concats this Mat2d with a scale of the specified width and height ratios.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     */
    postScale(sx: number, sy: number) {
        //Multiply first row by width ratio
        this.c1r1 *= sx; this.c2r1 *= sx; this.c3r1 *= sx;
        //Multiply second row by height ratio
        this.c1r2 *= sy; this.c2r2 *= sy; this.c3r2 *= sy;
    }

    /**
     * Pre concats this Mat2d with a scale of the specified width and height ratios.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     */
    preScale(sx: number, sy: number) {
        //Multiply first column by width ratio
        this.c1r1 *= sx;
        this.c1r2 *= sx;
        //Multiply second column by height ratio
        this.c2r1 *= sy;
        this.c2r2 *= sy;
    }

    /**
     * Post concats this Mat2d with a stretch of the specified ratio.
     * @param ratio the percentage by whih to stretch all in directions.
     */
    postStretch(ratio: number) {
        this.postScale(ratio, ratio);
    }

    /**
     * Pre concats this Mat2d with a stretch of the specified ratio.
     * @param ratio the percentage by which to stretch all in directions.
     */
    preStretch(ratio: number) {
        this.preScale(ratio, ratio);
    }

    /**
     * Post concats this Mat2d with a translation by the specified vector.
     */
    postTranslate(vec: Vec2Like) {
        this.postTranslate$(vec.x, vec.y);
    }

    /**
     * Post concats this Mat2d with a translation by vector (dx,dy).
     */
    postTranslate$(dx: number, dy: number) {
        //(1,0,x)*(c3r1,c3r2,1) = c3r1 + x
        this.c3r1 += dx;
        this.c3r2 += dy;
    }

    /**
     * Post concats this Mat2d with a translation by vector (dx,dy).
     */
    preTranslate(vec: Vec2Like) {
        this.preTranslate$(vec.x, vec.y);
    }

    /**
     * Post concats this Mat2d with a translation by vector (dx,dy).
     */
    preTranslate$(dx: number, dy: number) {
        //(c1r1,c2r1,c3r1)*(x,y,1) = (c1r1x + c2r1y + c3r1)
        this.c3r1 += this.c1r1 * dx + this.c2r1 * dy;
        this.c3r2 += this.c1r2 * dx + this.c2r2 * dy;
    }

    /**
     * Maps the source point and writes the result into dst.
     * @param src the point to map.
     * @param dst where to write the result.
     */
    map(src: PointLike, dst: PointLike) {
        this.map$(src.x, src.y, dst);
    }

    /**
     * Maps the point (x,y) and writes the result into dst.
     * @param x the x coordinate of the point.
     * @param y the y coordinate of the point.
     * @param dst where to write the result. 
     */
    map$(x: number, y: number, dst: PointLike) {
        dst.x = this.c1r1 * x + this.c2r1 * y + this.c3r1;
        dst.y = this.c1r2 * x + this.c2r2 * y + this.c3r2;
    }

    /**
     * Maps a subset of points in the specified array.
     * @param src array of points to map.
     * @param srcOffset offset into src of the first point in the subset.
     * @param count the number of points to include.
     */
    mapPoints(src: PointLike[], srcOffset = 0, count = src.length - srcOffset) {
        let {c1r1, c2r1, c3r1, c1r2, c2r2, c3r2 } = this;
        while (count-- > 0) {
            // Get the (x,y) coordinates of the next point
            let next = src[srcOffset++];
            let {x, y} = next;
            // Map the point
            next.x = c1r1 * x + c2r1 * y + c3r1;
            next.y = c1r2 * x + c2r2 * y + c3r2;
        }
    }

    /**
     * Maps a subset of points in the specified array.
     * @param src array of points written as a series of (x,y) coordinates.
     * @param srcOffset offset into src of the first point in the subset.
     * @param count the number of points to include.
     */
    mapPoints$(src: Float32Array, srcOffset = 0, count = (src.length - srcOffset) >> 1) {
        let {c1r1, c2r1, c3r1, c1r2, c2r2, c3r2 } = this;
        while (count-- > 0) {
            // Get the (x,y) coordinates of the next point
            let x = src[srcOffset];
            let y = src[srcOffset+1];
            // Map the point
            src[srcOffset++] = c1r1 * x + c2r1 * y + c3r1;
            src[srcOffset++] = c1r2 * x + c2r2 * y + c3r2;
        }
    }

    /**
     * Maps the src rect and writes the result into dst.
     * @param src the source rectangle.
     * @param dst the destination rectangle.
     */
    mapRect(src: Rect, dst: Rect) {
        // Get the four corners of the src IRect
        let corners = src.corners();;
        // Map the four corners
        this.mapPoints(corners);
        // Enclose the mapped corners
        dst.setUnionOfPoints(corners);
    }
}

