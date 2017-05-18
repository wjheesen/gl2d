import { Renderer } from '../rendering/renderer';
import { ColorFStruct } from '../struct/colorf';
import { Point, IPoint } from '../struct/point'
import { IVec2, Vec2 } from '../struct/vec2'
import { IRect, Rect } from '../struct/rect'
import { IMat2d, Mat2dStruct, ScaleToFit, Mat2d } from '../struct/mat2d';
import { Mesh } from "./mesh";

/**
 * 2D drawable determined by matrix transformation of a mesh.
 */
export abstract class Drawable<R extends Renderer> {

    /**
     * Contains the vertex and index data for this drawable.
     */
    mesh: Mesh;

    /**
     * The color of this drawable (if any).
     */
    color?: ColorFStruct;

    /**
     * The matrix that maps this drawable from model space to world space.
     */
    matrix: Mat2dStruct;

    /**
     * Creates a drawable with the specified matrix transformation.
     * @param mesh the static mesh data for this drawable.
     * @param matrix matrix transformation of the drawable. Defaults to identity.
     */
    constructor(mesh: Mesh, color?: ColorFStruct, matrix?: Mat2dStruct) {
        this.mesh = mesh;
        this.color = color;
        this.matrix = matrix || Mat2dStruct.identity();
    }

    /**
     * Measures the boundaries of this drawable.
     * @returns the boundaries of this drawable, or null if the drawable has no vertices.
     */
    measureBoundaries() {
        let bounds = <Rect> null;
        let meshVertices = this.mesh.vertices;
        // Map each mesh vertex to get the drawable vertex that must be enclosed
        if(meshVertices.moveToFirst()){
            // Enclose first drawable vertex
            let matrix = this.matrix;
            let drawableVertex = new Point();
            matrix.map(meshVertices, drawableVertex);
            bounds = Rect.unionOfPoints([drawableVertex]);
            // Enclose remaining vertices
            while(meshVertices.moveToNext()){
                 matrix.map(meshVertices, drawableVertex);
                 bounds.unionPoint(drawableVertex);
            }
        }
        // Bounds will be null if model has no vertices
        return bounds;
    }

    /**
     * Converts a point in world space to a point in this drawable's model space using the inverse model matrix.
     * @param pointInWorld the point in world space.
     * @param inverse the inverse of this drawable's model matrix. If undefined, the inverse matrix will be calculated on the fly.
     * @param dst where to write the result. Defaults to new point.
     * @returns dst.
     */
    convertPointToModelSpace(pointInWorld: IPoint, inverseModelMatrix: IMat2d = Mat2d.inverse(this.matrix)){
        let dst = new Point();
        IMat2d.map(inverseModelMatrix, pointInWorld, dst);
        return dst;
    }

    /**
     * Converts the vertex at the specified position from model space to world space.
     * @param position the position of the vertex in the vertex buffer associated with this drawable's mesh.
     * @returns the position of the vertex in world space, or null if no vertex exists at the specified position.
     */
    convertVertexToWorldSpace(position: number){
        let vertices = this.mesh.vertices;
        if(vertices.moveToPosition(position)){
            let dst = new Point();
            this.matrix.map(vertices, dst);
            return dst;
        }
        return null;
    }

    /**
     * Checks if this drawable contains the point (x,y).
     * @param point the point to check.
     * @param inverse the inverse of this drawable's model matrix. If undefined, the inverse matrix will be calculated on the fly.
     */
    contains(pt: IPoint, inverse?: IMat2d) {
        let modelPoint = this.convertPointToModelSpace(pt, inverse);
        // this drawable contains the point if its mesh contains the model point
        return this.mesh.bounds.containsPoint(modelPoint) && this.mesh.vertices.contains(modelPoint);
    }

    /**
     * Offsets this drawable by the specified vector.
     */
    offset(vec: IVec2) {
        this.offset$(vec.x, vec.y);
    }

    /**
     * Offsets this drawable by the vector (dx,dy).
     */
    offset$(dx: number, dy: number) {
        this.matrix.postTranslate$(dx, dy);
    }

    /**
     * Transforms this drawable by the specified matrix.
     * @param matrix the transformation matrix.
     */
    transform(matrix: IMat2d) {
        this.matrix.postConcat(matrix);
    }

    /**
     * Maps this drawable to the destination Rect using the specified scale to fit option.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option.
     */
    mapToRect(dst: IRect, stf: ScaleToFit) {
        this.matrix.setRectToRect(this.mesh.bounds, dst, stf);
    }

    /**
     * Stretch-rotates this drawable across the line from p1 to p2.
     */
    stretchAcrossLine(p1: IPoint, p2: IPoint) {
        let bounds = this.mesh.bounds;
        let meshPivot = bounds.centerTop();
        let meshControl = bounds.centerBottom();
        // *Translate from mesh pivot to drawable pivot
        let pivot = p1;
        let vec = Vec2.fromPointToPoint(meshPivot, pivot);
        let start = Vec2.create(meshControl); start.add(vec);
        let end = p2;
        // Compute stretch rotation matrix
        this.matrix.setStretchRotateToPoint(start, end, pivot);
        this.matrix.preTranslate(vec); //*
    }

    /**
     * Draws this drawable using the specified renderer.
     */
    abstract draw(renderer: R): void;
}