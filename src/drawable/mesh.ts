import { IndexTupleBuffer } from '../struct/indextuple';
import { Mat2d } from '../struct/mat2d';
import { IPoint } from '../struct/point';
import { Rect } from '../struct/rect';
import { Vec2Struct } from '../struct/vec2';
import { VertexBuffer } from '../struct/vertex';

/**
 * Stores static vertex and index data that multiple graphics can share.
 */
export class Mesh {

    /**
     * Optional string identifier for this mesh.
     */
    public id?: string;

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
     * @param id an optional id for this mesh.
     */
    constructor(vertices: VertexBuffer, indices?: IndexTupleBuffer, id?: string, bounds = vertices.measureBoundaries()) {
        this.vertices = vertices;
        this.indices = indices;
        this.bounds = bounds;
        this.id = id;
    }

    /**
     * Creates a mesh with the specified source data.
     * @param source obejct containing the data for the mesh.
     */
    static fromSource(source: MeshSource){
        let vertices: VertexBuffer;
        let indices: IndexTupleBuffer;

        if(source.vertices instanceof VertexBuffer){
            vertices = source.vertices;
        } else if(source.vertices instanceof Float32Array){
            vertices = new VertexBuffer(source.vertices);
        } else {
            vertices = new VertexBuffer(new Float32Array(source.vertices));
        }
        
        if(source.indices){
            if(source.indices instanceof IndexTupleBuffer){
                indices = source.indices;
            } else if(source.indices instanceof Uint16Array){
                indices = new IndexTupleBuffer(source.indices);
            } else {
                indices = new IndexTupleBuffer(new Uint16Array(source.indices));
            }
        }

        return new Mesh(vertices, indices, source.id)
    }

    /**
     * Creates the mesh for a regular polygon with n sides.
     * @param n how many sides the polygon should have.
     * @param isFlatTopped whether the polygon is flat-topped (true) or pointy-topped (false). Defaults to false.
     * @param id an optional id for the mesh.
     */
    static polygon(n: number, isFlatTopped = false, id?: string) {
        // Generate the vertices
        let vertices = Mesh.polygonVertices(n, isFlatTopped);
        // Generate the indices
        let indices = Mesh.polygonIndices(n);
        //Construct the mesh and return
        return new Mesh(vertices, indices, id);
    }

    /**
     * Generates the vertices for a regular polygon centered at (0,0).
     * @param n how many sides the polygon should have.
     * @param isFlatTopped whether the polygon is flat-topped (true) or pointy-topped (false). Defaults to false.
     */
    static polygonVertices(n: number, isFlatTopped = false) {
        // Create a mesh big enough to hold the n vertices
        let mesh = VertexBuffer.create(n);
        // Create a matrix to rotate from vertex to vertex
        let angle = 2 * Math.PI / n;
        let rotation = Mat2d.rotate(angle)
        // Begin with the vertex (1,0), rotating for flat top polygon if requested
        let vertex = Vec2Struct.create$(0, 1);
        if(isFlatTopped){ Mat2d.rotate(angle/2).map(vertex, vertex); }
        mesh.put(vertex);
        //Perform the rotation and add the result to the array until it is full
        while (mesh.hasValidPosition()) {
            rotation.map(vertex, vertex);
            mesh.put(vertex);
        }
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
     * Creates the mesh for a star with n points and the specified inner and outer radii.
     * @param n how many points the star should have.
     * @param ratio ratio of the inner radius to the outer radius.
     * @param id an optional id for the mesh.
     */
    static star(n: number, ratio: number, id?: string) {
        // Generate the vertices
        let vertices = Mesh.starVertices(n, ratio);
        // Generate the indices
        let indices = Mesh.starIndices(n);
        //Construct the mesh and return
        return new Mesh(vertices, indices, id);
    }

    /**
     * Generates the vertices for a star centered at (0,0).
     * @param points how many points the star should have.
     * @param ratio ratio of the inner radius to the outer radius.
     */
    static starVertices(points: number, ratio: number) {
        // Create mesh big enough to hold the n inner vertices and n outer vertices
        let mesh = VertexBuffer.create(points + points);
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

   /**
     * Checks if this mesh contains the specified point
     * @param point the point to check.
     */
    contains(point: IPoint){
        return this.bounds.contains(point) && this.vertices.contains(point);
    }

}

export class MeshSource {
    vertices: number[] | Float32Array | VertexBuffer; 
    indices?: number[] | Uint16Array | IndexTupleBuffer;
    id?: string;
}