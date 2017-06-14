import { Rect, RectLike } from '../struct/rect';
import { IndexTupleBuffer } from '../struct/indexTuple';
import { Vec2Struct } from '../struct/vec2';
import { Mat2d } from '../struct/mat2d';
import { VertexBuffer } from '../struct/vertex';
import { Mesh } from './mesh';

export class PolygonMesh extends Mesh {

     /**
     * Creates the mesh for a regular polygon with n sides.
     * @param n how many sides the polygon should have.
     * @param isFlatTopped whether the polygon is flat-topped (true) or pointy-topped (false). Defaults to false.
     * @param id an optional id for the mesh.
     */
    static regular(n: number, isFlatTopped = false, id?: string) {
        let vertices = PolygonMesh.regularVertices(n, isFlatTopped);
        let indices = PolygonMesh.regularIndices(n);
        return new PolygonMesh(vertices, indices, id);
    }

    /**
     * Generates the vertices for a regular polygon centered at (0,0).
     * @param n how many sides the polygon should have.
     * @param isFlatTopped whether the polygon is flat-topped (true) or pointy-topped (false). Defaults to false.
     */
    static regularVertices(n: number, isFlatTopped = false) {
        // Create a buffer big enough to hold the n vertices
        let vertices = VertexBuffer.create(n);
        // Create a matrix to rotate from vertex to vertex
        let angle = 2 * Math.PI / n;
        let rotation = Mat2d.rotate(angle)
        // Begin with the vertex (1,0), rotating for flat top polygon if requested
        let vertex = Vec2Struct.create$(0, 1);
        if(isFlatTopped){
             Mat2d.rotate(angle/2).map(vertex, vertex);
        }
        vertices.rset(vertex);
        // Keep rotating the point and adding to buffer till it is full
        while (vertices.hasValidPosition()) {
            rotation.map(vertex, vertex);
            vertices.rset(vertex);
        }
        return vertices;
    }

    /**
     * Generates the indices for a regular mesh with n sides.
     * The mesh will have 3*(n-2) indices.
     * @param n how many sides the mesh should have.
     */
    static regularIndices(n: number) {
        // Create an array big enough to hold all the index tuples
        let indices = IndexTupleBuffer.create(n - 2);
        // Compute indices and add to array until it is full
        let second = 1, third = 2;
        while (indices.hasValidPosition()) {
            indices.rset$(0, second, third);
            second = third++
        }
        // Return the indices
        return indices;
    }

    /**
     * Creates the mesh for a rectangle
     * @param id an optional id for the mesh.
     */
     static rectangle(rect: Rect, id?: string) {
         let vertices = PolygonMesh.rectangleVertices(rect);
         let indices = PolygonMesh.regularIndices(4);
         return new PolygonMesh(vertices, indices, id, rect);
     }

    /**
      * Extracts the vertices from the specified rect into a new vertex buffer.
      * @param rect the rect from which to extract the vertices.
      */
     static rectangleVertices(rect: RectLike) {
         return new VertexBuffer(
             new Float32Array([
                 rect.left, rect.top,
                 rect.left, rect.bottom,
                 rect.right, rect.bottom,
                 rect.right, rect.top])
         );
      }

    /**
     * Creates the mesh for a star with n points and the specified inner and outer radii.
     * @param n how many points the star should have.
     * @param ratio ratio of the inner radius to the outer radius.
     * @param id an optional id for the mesh.
     */
    static star(n: number, ratio: number, id?: string) {
        let vertices = PolygonMesh.starVertices(n, ratio);
        let indices = PolygonMesh.starIndices(n);
        return new PolygonMesh(vertices, indices, id);
    }

    /**
     * Generates the vertices for a star centered at (0,0).
     * @param points how many points the star should have.
     * @param ratio ratio of the inner radius to the outer radius.
     */
    static starVertices(points: number, ratio: number) {
        // Create vertex buffer big enough to hold the n inner vertices and n outer vertices
        let vertices = VertexBuffer.create(points + points);
        // Calculate the rotation angle
        let angle = 2 * Math.PI / points;
        // Create a rotation matrix
        let rotation = new Mat2d();
        // Translate the center point vertically by the
        // outer radius to get the first outer vertex.
        let outerVertex = Vec2Struct.create$(0, 1);
        // Translate the center point vertically by the inner radius
        // and rotate by half the angle to get the first inner vertex
        let innerVertex = Vec2Struct.create$(0, ratio);
        rotation.setRotate(0.5 * angle);
        rotation.map(innerVertex, innerVertex);
        // Add the first outer and inner vertices to the buffer
        vertices.rset(outerVertex);
        vertices.rset(innerVertex);
        // Set the matrix to rotate by the full angle
        rotation.setRotate(angle);
        // Keep rotating the inner and outer vertices and
        // adding them to the array until it is full.
        while (vertices.hasValidPosition()) {
            rotation.map(outerVertex, outerVertex);
            rotation.map(innerVertex, innerVertex)
            vertices.rset(outerVertex);
            vertices.rset(innerVertex);
        }
        // Return the path
        return vertices;
    }


    /**
     * Generates the indices for a star with n points.
     * The star will have 3*(n-2) inner indices and 3n outer indices.
     * @param n how many points the star should have.
     */
    static starIndices(n: number) {
        let innerIndexCount = n - 2;
        let outerIndexCount = n;
        // Create an array big enough to hold all the indices
        let indices = IndexTupleBuffer.create(innerIndexCount + outerIndexCount);
        // Compute inner indices and add to array
        let first = 1, second = 3, third = 5;
        while (innerIndexCount--) {
            indices.rset$(first, second, third);
            second = third++; third++;
        }
        // Computer outer indices and add to array
        first = 2 * n - 1; second = 0; third = 1;
        while (outerIndexCount--) {
            indices.rset$(first, second, third);
            first = third++; second = third++
        }
        // Return the indices
        return indices;
    }

    contains$(x: number, y: number): boolean {
        return this.vertices.contains$(x, y);
    }
}