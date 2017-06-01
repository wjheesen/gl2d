import { VertexBuffer } from '../struct/vertex';
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
        return Shape.measureBoundaries(this.matrix, this.mesh.vertices);
    }

    /**
     * Measures the boundaries of a shape in world space.
     * @param matrix the matrix that maps the shape to world space.
     * @param vertices the vertices of the shape in model space.
     * @returns the boundaries of the shape, or null if the shape has no vertices.
     */
    static measureBoundaries(matrix: IMat2d, vertices: VertexBuffer){
        let bounds = <Rect> null;
        if(vertices.moveToFirst()){
            // Enclose the first mapped vertex
            let vertex = new Point();
            IMat2d.map(matrix, vertices, vertex);
            bounds = Rect.unionOfPoints([vertex]);
            // Enclose the remaining vertices
            while(vertices.moveToNext()){
                IMat2d.map(matrix, vertices, vertex);
                bounds.unionPoint(vertex);
            }
        }
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
        return Shape.stretchAcrossLine(this.matrix, this.mesh, p1, p2);
    }
    
    /**
     * Sets the specified matrix to stretch rotate the specified mesh across the line from p1 to p2.
     */
    static stretchAcrossLine(matrix: IMat2d, mesh: Mesh, p1: IPoint, p2: IPoint) {
        let bounds = mesh.bounds;
        let meshPivot = bounds.centerTop();
        let meshControl = bounds.centerBottom();
        // *Translate from mesh pivot to shape pivot
        let pivot = p1;
        let vec = Vec2.fromPointToPoint(meshPivot, pivot);
        let start = Vec2.create(meshControl); 
        start.add(vec);
        // Stretch rotate from translated control point to p2, with pivot at p1
        IMat2d.setStretchRotateToPoint(matrix, start, p2, pivot);
        IMat2d.preTranslate(matrix, vec); //*
    }
}