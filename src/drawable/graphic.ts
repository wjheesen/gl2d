import { Point, IPoint } from '../struct/point'
import { IVec2 } from '../struct/vec2'
import { Rect } from "../struct/rect";
import { Mat2d, IMat2d } from "../struct/mat2d";
import { Mat3Struct } from "../struct/mat3";

/**
 * A graphic that can be transformed by altering its model matrix.
 */
export abstract class Graphic {

    /**
     * The matrix that maps this graphic from model space to world space.
     */
    matrix: Mat3Struct;

    /**
     * Creates a new graphic with the specified matrix transformation.
     * @param matrix the initial matrix transformation. Defaults to identity.
     */
    constructor(matrix?: Mat3Struct) {
        this.matrix = matrix || Mat3Struct.identity();
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
        return Point.create$(this.matrix.c3r1, this.matrix.c3r2);
    }

    /**
     * Converts a point in this graphic's model space to a point in world space.
     * @param pointInModel the point in model space.
     * @param dst where to store the result.
     * @returns dst.
     */
    convertPointToWorldSpace(pointInModel: IPoint, dst: IPoint = new Point()){
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
    convertPointToModelSpace(pointInWorld: IPoint, inverseModelMatrix: IMat2d = Mat2d.inverse(this.matrix)){
        let dst = new Point();
        IMat2d.map(inverseModelMatrix, pointInWorld, dst);
        return dst;
    }

    /**
     * Checks if this graphic contains the point (x,y).
     * @param point the point to check.
     * @param inverse the inverse of this graphic's model matrix. If undefined, the inverse matrix will be calculated on the fly, resulting in a potential performance hit.
     * @returns true if the point lies on or within this graphic; false otherwise.
     */
    abstract contains(pt: IPoint, inverse?: IMat2d): boolean;

    /**
     * Offsets this graphic by the specified vector.
     */
    offset(vec: IVec2) {
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
    offsetTo(center: IPoint){
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
    transform(matrix: IMat2d) {
        this.matrix.postConcat(matrix);
    }
}