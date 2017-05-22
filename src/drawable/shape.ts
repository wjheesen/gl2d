import { Mesh } from './mesh';
import { Graphic } from "./graphic";
import { IPoint, Point } from "../struct/point";
import { Rect, IRect } from "../struct/rect";
import { IMat2d, Mat2dStruct, ScaleToFit } from '../struct/mat2d';
import { Vec2 } from '../struct/vec2';

/**
 * Shape defined by matrix transformation of a mesh.
 */
export class Shape extends Graphic {

    /**
     * Holds the static vertex and index data for this shape.
     * The data must be loaded into WebGL in order to draw this shape.
     */
    mesh: Mesh;

    /**
     * Creates a shape with the specified mesh data and initial transformation matrix.
     * @param mesh the static vertex and index data data for this shape.
     * @param matrix the initial transformation matrix. Defaults to identiy.
     */
    constructor(mesh: Mesh, matrix?: Mat2dStruct){
        super(matrix);
        this.mesh = mesh;
    }

    /**
     * Measures the boundaries of this shape in world space.
     * @returns the boundaries of this shape, or null if the shape has no vertices.
     */
    measureBoundaries() {
        let bounds = <Rect> null;
        let vertices = this.mesh.vertices;
        let matrix = this.matrix;
        // Map each mesh vertex to get the shape vertex that must be enclosed
        if(vertices.moveToFirst()){
            // Enclose first shape vertex
            let vertex = new Point();
            matrix.map(vertices, vertex);
            bounds = Rect.unionOfPoints([vertex]);
            // Enclose remaining vertices
            while(vertices.moveToNext()){
                 matrix.map(vertices, vertex);
                 bounds.unionPoint(vertex);
            }
        }
        // Bounds will be null if model has no vertices
        return bounds;
    }

    /**
     * Measures the position of this shape's control point in world space.
     * @returns the position of the control point in world space.
     */
    measureControl(){
        return this.convertPointToWorldSpace(this.mesh.bounds.centerBottom());
    }

    /**
     * Measures the position of this shape's fixed point in world space.
     * @returns the position of the fixed point in world space.
     */
    measurePivot(){
        return this.convertPointToWorldSpace(this.mesh.bounds.centerTop());
    }

    /**
     * Measures the position of the specified vertex in world space.
     * @param index the index of the vertex in the buffer associated with this shape's mesh.
     * @returns the position of the vertex in world space, or null if no vertex exists at the specified position.
     */
    measureVertex(index: number){
        let vertices = this.mesh.vertices;
        if(vertices.moveToPosition(index)){
            return this.convertPointToWorldSpace(vertices);
        }
        return null;
    }

    /**
     * Checks if this shape contains the point (x,y).
     * @param point the point to check.
     * @param inverse the inverse of this shape's model matrix. If undefined, the inverse matrix will be calculated on the fly.
     */
    contains(pt: IPoint, inverse?: IMat2d) {
        // This shape contains the point if its mesh contains the model point
        let modelPoint = this.convertPointToModelSpace(pt, inverse);
        return this.mesh.bounds.contains(modelPoint) && this.mesh.vertices.contains(modelPoint);
    }

    /**
     * Maps this shape to the destination Rect using the specified scale to fit option.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option. Defaults to Fill.
     */
    mapToRect(dst: IRect, stf = ScaleToFit.Fill) {
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