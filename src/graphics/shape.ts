import { Point, IPoint } from '../struct/point'
import { Vec2, IVec2 } from '../struct/vec2'
import { IRect } from '../struct/rect'
import { IMat2d, Mat2dStruct, ScaleToFit } from '../struct/mat2d';
import { Mesh } from './mesh'

/**
 * Shape determined by matrix transformation of a mesh.
 */
export class Shape {

    /**
     * Contains the vertex and index data for this shape.
     */
    public mesh: Mesh;

    /**
     * The matrix that maps this shape from model space to world space.
     */
    public matrix = new Mat2dStruct();

    /**
     * The inverse of this shape's model matrix. Cached for performance of contains method.
     */
    public inverse = new Mat2dStruct();

    /**
     * Creates a shape that is a matrix transformation of the specified mesh.
     * @param mesh the static polygon data for this shape.
     * @param matrix matrix transformation of the shape. Defaults to identity.
     */
    constructor(mesh: Mesh, matrix?: Mat2dStruct) {
        this.mesh = mesh;
        if (matrix) {
            this.matrix = matrix;
            this.inverse.set(matrix);
            this.inverse.invert();
        } else {
            this.matrix.setIdentity()
            this.inverse.setIdentity()
        }
    }

    /**
     * Checks if this shape contains the point (x,y).
     * @param point the point to check.
     */
    contains(pt: IPoint) {
        return this.contains$(pt.x, pt.y);
    }

    /**
     * Checks if this shape contains the point (x,y).
     * @param x the x coordinate of the point to check.
     * @param y the y coordinate of the point to check.
     */
    contains$(x: number, y: number) {
        let modelPoint = new Point();
        // Convert the point to model space
        this.inverse.map$(x, y, modelPoint) ;
        // Check if this shape's model contains the point
        return this.mesh.contains(modelPoint);
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
        this.inverse.postTranslate$(-dx, -dy);
    }

    /**
     * Transforms this shape by the specified matrix.
     * @param matrix the transformation matrix.
     */
    transform(matrix: IMat2d) {
        this.matrix.postConcat(matrix);
        this.inverse.set(this.matrix);
        this.inverse.invert();
    }

    /**
     * Fits this shape inside dst using the specified scale to fit option.
     * @param dst the destination rectangle.
     * @param stf the scale to fit option.
     */
    fitInRect(dst: IRect, stf: ScaleToFit) {
        this.matrix.setRectToRect(this.mesh.bounds, dst, stf);
        this.inverse.set(this.matrix);
        this.inverse.invert();
    }

    /**
     * Stretch-rotates this shape across the line from p1 to p2.
     */
    stretchAcrossLine(p1: IPoint, p2: IPoint) {
        // *Translate from mesh pivot to shape pivot
        let pivot = p1;
        let vec = Vec2.fromPointToPoint(this.mesh.pivot, pivot);
        let start = Vec2.create(this.mesh.control); start.add(vec);
        let end = p2;
        // Compute stretch rotation matrix
        this.matrix.setStretchRotateToPoint(start, end, pivot);
        this.matrix.preTranslate(vec); //*
        this.inverse.set(this.matrix);
        this.inverse.invert();
    }
}