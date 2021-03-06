import { Point, PointLike } from '../struct/point'
import { Vec2Like } from '../struct/vec2'
import { Rect } from "../struct/rect";
import { Mat2d, Mat2dStruct } from '../struct/mat2d';

/**
 * A graphic that can be transformed by altering its model matrix.
 */
export abstract class Graphic {

    /**
     * The matrix that maps this graphic from model space to world space.
     */
    matrix: Mat2dStruct;

    /**
     * Creates a new graphic with the specified matrix transformation.
     * @param matrix the initial matrix transformation. Defaults to identity.
     */
    constructor(matrix?: Mat2dStruct) {
        this.matrix = matrix || Mat2dStruct.identity();
    }

    /**
     * Measures the boundaries of this graphic in world space.
     * @returns the boundaries of this graphic.
     */
    abstract measureBoundaries(): Rect;

    /**
     * Measures the position of this graphic's center point in world space.
     * Assumes the model for the graphic is centered at the origin.
     * @returns the position of the center point in world space.
     */
    measureCenter(){
        return new Point(this.matrix.c3r1, this.matrix.c3r2);
    }

    /**
     * Converts a point in this graphic's model space to a point in world space.
     * @param pointInModel the point in model space.
     * @param dst where to store the result.
     * @returns dst.
     */
    convertPointToWorldSpace(pointInModel: PointLike, dst = new Point()){
        this.matrix.map(pointInModel, dst);
        return dst;
    }

    /**
     * Converts a point in world space to a point in this graphic's model space using the inverse model matrix.
     * @param pointInWorld the point in world space.
     * @param inverse the inverse of this graphic's model matrix. If undefined, the inverse matrix will be calculated on the fly, resulting in a potential performance hit.
     * @param dst where to write the result. Defaults to new point.
     * @returns dst.
     */
    convertPointToModelSpace(pointInWorld: PointLike, inverse = Mat2d.inverse(this.matrix), dst = new Point()){
        inverse.map(pointInWorld, dst);
        return dst;
    }

    /**
     * Checks if this graphic contains the point (x,y).
     * @param point the point to check.
     * @param inverse the inverse of this graphic's model matrix. If undefined, the inverse matrix will be calculated on the fly, resulting in a potential performance hit.
     * @returns true if the point lies on or within this graphic; false otherwise.
     */
    abstract contains(pt: PointLike, inverse?: Mat2d): boolean;

    /**
     * Offsets this graphic by the specified vector.
     */
    offset(vec: Vec2Like) {
        this.offset$(vec.x, vec.y);
    }

    /**
     * Offsets this graphic by the vector (dx,dy).
     */
    offset$(dx: number, dy: number) {
        this.matrix.postTranslate$(dx, dy);
    }

    /**
     * Offsets this graphic so that it is centered at the specified point.
     * Assumes the model for the graphic is centered at the origin.
     * @param center the new center point for this graphic.
     */
    offsetTo(center: PointLike){
        this.offsetTo$(center.x, center.y);
    }

    /**
     * Offsets this graphic so that it is centered at the point (x,y).
     * Assumes the model for the graphic is centered at the origin.
     */
    offsetTo$(x: number, y: number){
        this.matrix.c3r1 = x;
        this.matrix.c3r2 = y;
    }

    /**
     * Transforms this graphic by the specified matrix.
     * @param matrix the transformation matrix.
     */
    transform(matrix: Mat2d) {
        this.matrix.postConcat(matrix);
    }

    /**
     * Scales this graphic by the specified scale factors, with a pivot point at the center of the shape.
     * @param sx the horizontal scale factor.
     * @param sy the vertical scale factor.
     */
    scale(sx: number, sy: number){
        this.transform(Mat2d.scale(sx, sy, this.measureCenter()));
    }

    /**
     * Stretches this graphic by the specified ratio, with a pivot point at the center of the shape.
     * @param ratio the percentage by which to scale in all directions.
     */
    stretch(ratio: number){
        this.scale(ratio, ratio);
    }

    /**
     * Scales this graphic by the specified angle, with a pivot point at the center of the shape.
     * @param radians the angle in radians.
     */
    rotate(radians: number){
        this.transform(Mat2d.rotate(radians, this.measureCenter()));
    }
}