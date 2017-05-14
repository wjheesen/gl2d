import {IndexTupleBuffer} from'../struct/indextuple'
import { Vec2Struct } from '../struct/vec2'
import { Mat2d } from '../struct/mat2d'
import { Rect } from '../struct/rect'
import { VertexBuffer } from '../struct/vertex'

/**
 * Stores static vertex and index data that multiple graphics can share.
 */
export class Mesh {

    /**
     * The vertex data.
     */
    public vertices: VertexBuffer;

    /**
     * The vertex indices that divide the mesh into renderable triangles. Null if no indices are needed.
     */
    public indices: IndexTupleBuffer;

    /**
     * The smallest rect containing each mesh vertex.
     */
    public bounds: Rect;

    /**
     * The byte offset of this mesh's vertex data in a vertex buffer. Defaults to 0.
     */
    public vertexBufferOffset = 0;

    /**
     * The byte offset of this mesh's index data in an element buffer. Defaults to 0.
     */
    public elementBufferOffset = 0;

    /**
     * Creates a mesh with the specified vertices and indices.
     * @param vertices the mesh vertices.
     * @param indices the indices that divide the mesh into renderable triangles.
     * @param bounds the boundaries of the mesh.
     */
    constructor(vertices: VertexBuffer, indices?: IndexTupleBuffer, bounds = vertices.measureBoundaries()) {
        this.vertices = vertices;
        this.indices = indices;
        this.bounds = bounds;
    }

    /**
     * Creates the mesh for a regular mesh with n sides.
     * @param n how many sides the mesh should have.
     */
    static polygon(n: number) {
        // Generate the vertices
        let vertices = Mesh.polygonVertices(n);
        // Generate the indices
        let indices = Mesh.polygonIndices(n);
        //Construct the mesh and return
        return new Mesh(vertices, indices);
    }

    /**
     * Creates the mesh for a star with n points and the specified inner and outer radii.
     * @param n how many points the star should have.
     * @param innerRadius distance from center of star to inner vertex.
     * @param outerRadius distance from center of start to outer vertex.
     */
    static star(n: number, innerRadius: number, outerRadius: number) {
        // Generate the vertices
        let vertices = Mesh.starVertices(n, innerRadius, outerRadius);
        // Generate the indices
        let indices = Mesh.starIndices(n);
        //Construct the mesh and return
        return new Mesh(vertices, indices);
    }

    /**
     * Creates the mesh for a 4 vertex diamond.
     */
    static diamond() {
        return Mesh.star(2, .5, 1)
    }

    /**
     * Creates the mesh for a square.
     */
    static square() {
        return Mesh.rectangle(Rect.ltrb(0, 1, 1, 0));
    }

    /**
     * Creates the mesh for a rectangle
     */
    static rectangle(rect: Rect) {
        // Extract the verties from the rect
        let vertices = Mesh.rectVertices(rect);
        // Indices are same as mesh(4)
        let indices = Mesh.polygonIndices(4);
        // Construct mesh and return
        return new Mesh(vertices, indices, rect);
    }

    /**
     * Creates the mesh for a 5 point star.
     */
    static star5() {
        return Mesh.star(5, 0.4, 1); //Star
    }

    /**
     * Extracts the vertices from the specified rect into a new vertex buffer.
     * @param rect the rect from which to extract the vertices.
     */
    static rectVertices(rect: Rect) {
        return new VertexBuffer(
            new Float32Array([
                rect.left, rect.top,
                rect.left, rect.bottom,
                rect.right, rect.bottom,
                rect.right, rect.top])
        );
    }

    /**
     * Generates the vertices for a regular mesh centered at (0,0).
     * @param sides how many sides the mesh should have.
     * @param radius distance from center of mesh to a vertex.
     */
    static polygonVertices(sides: number, radius = 1) {
        // Create a mesh big enough to hold the n vertices
        let mesh = VertexBuffer.create(sides);
        // Translate the center point vertically by the
        // radius to get the first vertex.
        let vertex = Vec2Struct.create$(0, radius);
        // Add the first vertex to the mesh
        mesh.put(vertex);
        //Create a matrix to rotate the vertex about the center point
        let rotation = Mat2d.rotate(2 * Math.PI / sides);
        //Perform the rotation and add the result to the array until it is full
        while (mesh.hasValidPosition()) {
            rotation.map(vertex, vertex);
            mesh.put(vertex);
        }
        // Return the path
        return mesh;
    }

    /**
     * Generates the indices for a regular mesh with n sides.
     * The mesh will have 3*(n-2) indices.
     * @param n how many sides the mesh should have.
     */
    static polygonIndices(n: number) {
        // Create an array big enough to hold all the index tuples
        let indices = IndexTupleBuffer.create(n - 2);
        // Compute indices and add to array until it is full
        let second = 1, third = 2;
        while (indices.hasValidPosition()) {
            indices.put$(0, second, third);
            second = third++
        }
        // Return the indices
        return indices;
    }

    /**
     * Generates the vertices for a star centered at (0,0).
     * @param points how many points the star should have.
     * @param innerRadius distance from center of star to an inner vertex.
     * @param outerRadius distance from center of start to an outer vertex.
     */
    static starVertices(points: number, innerRadius: number, outerRadius: number) {
        // Create mesh big enough to hold the n inner vertices and n outer vertices
        let mesh = VertexBuffer.create(points + points);
        // Calculate the rotation angle
        let angle = 2 * Math.PI / points;
        // Create a rotation matrix
        let rotation = new Mat2d();
        // Translate the center point vertically by the
        // outer radius to get the first outer vertex.
        let outerVertex = Vec2Struct.create$(0, outerRadius);
        // Translate the center point vertically by the inner radius
        // and rotate by half the angle to get the first inner vertex
        let innerVertex = Vec2Struct.create$(0, innerRadius);
        rotation.setRotate(0.5 * angle);
        rotation.map(innerVertex, innerVertex);
        // Add the first outer and inner vertices to the mesh
        mesh.put(outerVertex);
        mesh.put(innerVertex);
        //Set the matrix to rotate by the full angle
        rotation.setRotate(angle);
        //Keep rotating the inner and outer vertices and
        //adding them to the array until it is full.
        while (mesh.hasValidPosition()) {
            rotation.map(outerVertex, outerVertex);
            rotation.map(innerVertex, innerVertex)
            mesh.put(outerVertex);
            mesh.put(innerVertex);
        }
        // Return the path
        return mesh;
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
            indices.put$(first, second, third);
            second = third++; third++;
        }
        // Computer outer indices and add to array
        first = 2 * n - 1; second = 0; third = 1;
        while (outerIndexCount--) {
            indices.put$(first, second, third);
            first = third++; second = third++
        }
        // Return the indices
        return indices;
    }
}