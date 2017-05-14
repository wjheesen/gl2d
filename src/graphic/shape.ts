import { Point, IPoint } from '../struct/point'
import { IVec2, Vec2 } from '../struct/vec2'
import { IRect, Rect } from '../struct/rect'
import { IMat2d, Mat2dStruct, ScaleToFit, Mat2d } from '../struct/mat2d';
import { Mesh } from "./mesh";

/**
 * Graphic determined by matrix transformation of a mesh.
 */
export abstract class Graphic {

    /**
     * Contains the vertex and index data for this shape.
     */
    public mesh: Mesh;

    /**
     * The matrix that maps this shape from model space to world space.
     */
    public matrix: Mat2dStruct;

    /**
     * Creates a shape with the specified matrix transformation.
     * @param mesh the static mesh data for this shape.
     * @param matrix matrix transformation of the shape. Defaults to identity.
     */
    constructor(mesh: Mesh, matrix?: Mat2dStruct) {
        this.matrix = matrix || Mat2dStruct.identity();
    }

    /**
     * Measures the boundaries of this shape.
     * @returns the boundaries of this shape, or null if the shape has no vertices.
     */
    measureBoundaries() {
        let bounds = <Rect> null;
        let meshVertices = this.mesh.vertices;
        // Map each mesh vertex to get the shape vertex that must be enclosed
        if(meshVertices.moveToFirst()){
            // Enclose first shape vertex
            let matrix = this.matrix;
            let shapeVertex = new Point();
            matrix.map(meshVertices, shapeVertex);
            bounds = Rect.unionOfPoints([shapeVertex]);
            // Enclose remaining vertices
            while(meshVertices.moveToNext()){
                 matrix.map(meshVertices, shapeVertex);
                 bounds.unionPoint(shapeVertex);
            }
        }
        // Bounds will be null if model has no vertices
        return bounds;
    }

    /**
     * Converts a point in world space to a point in this shape's model space using the inverse model matrix.
     * @param pointInWorld the point in world space.
     * @param inverse the inverse of this shape's model matrix. If undefined, the inverse matrix will be calculated on the fly.
     * @param dst where to write the result. Defaults to new point.
     * @returns dst.
     */
    convertPointToModelSpace(pointInWorld: IPoint, inverseModelMatrix?: IMat2d){
        // Compute inverse if not passed in
        if(!inverseModelMatrix){
            inverseModelMatrix = Mat2d.create(this.matrix);
            IMat2d.invert(inverseModelMatrix);
        }
        // Map point to model space
        let dst = new Point();
        IMat2d.map(inverseModelMatrix, pointInWorld, dst);
        return dst;
    }

    /**
     * Checks if this shape contains the point (x,y).
     * @param point the point to check.
     * @param inverse the inverse of this shape's model matrix. If undefined, the inverse matrix will be calculated on the fly.
     */
    contains(pt: IPoint, inverse?: IMat2d) {
        let modelPoint = this.convertPointToModelSpace(pt, inverse);
        // this shape contains the point if its mesh contains the model point
        return this.mesh.bounds.containsPoint(modelPoint) && this.mesh.vertices.contains(modelPoint);
    }

    /**
     * Offsets this shape by the specified vector.
     */
    offset(vec: IVec2) {
        this.offset$(vec.x, vec.y);
    }

    /**
     * Offsets this shape by the vector (dx,dy).
     */
    offset$(dx: number, dy: number) {
        this.matrix.postTranslate$(dx, dy);
    }

    /**
     * Transforms this shape by the specified matrix.
     * @param matrix the transformation matrix.
     */
    transform(matrix: IMat2d) {
        this.matrix.postConcat(matrix);
    }

    /**
     * Maps this shape to the destination Rect using the specified scale to fit option.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option.
     */
    mapToRect(dst: IRect, stf: ScaleToFit) {
        this.matrix.setRectToRect(this.mesh.bounds, dst, stf);
    }

    /**
     * Stretch-rotates this shape across the line from p1 to p2.
     */
    stretchAcrossLine(p1: IPoint, p2: IPoint) {
        let bounds = this.mesh.bounds;
        let meshPivot = bounds.centerTop();
        let meshControl = bounds.centerBottom();
        // *Translate from mesh pivot to shape pivot
        let pivot = p1;
        let vec = Vec2.fromPointToPoint(meshPivot, pivot);
        let start = Vec2.create(meshControl); start.add(vec);
        let end = p2;
        // Compute stretch rotation matrix
        this.matrix.setStretchRotateToPoint(start, end, pivot);
        this.matrix.preTranslate(vec); //*
    }
}