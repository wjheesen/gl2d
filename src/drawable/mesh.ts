import { measureMiter } from '../math/miter';
import { MeshSpecification } from '../specification/mesh';
import { PolygonSpecification } from '../specification/polygon';
import { RectangleSpecification } from '../specification/rectangle';
import { SpraySpecification } from '../specification/spray';
import { StarSpecification } from '../specification/star';
import { IndexTupleBuffer } from '../struct/indextuple';
import { Mat2d } from '../struct/mat2d';
import { Point, PointLike } from '../struct/point';
import { Rect, RectLike } from '../struct/rect';
import { Vec2, Vec2Buffer, Vec2Struct } from '../struct/vec2';
import { VertexBuffer } from '../struct/vertex';
import { Shape } from './shape';

/**
 * Stores static vertex and index data that multiple graphics can share.
 */
export abstract class Mesh {

    /**
     * Optional string identifier for this mesh.
     */
    public id?: string;

    /**
     * The vertex data.
     */
    public vertices: VertexBuffer;

    /**
     * The indices for each triangle in this mesh (if any).
     */
    public triangleIndices?: IndexTupleBuffer;

    /**
     * The smallest rect containing each mesh vertex.
     */
    public bounds: Rect;

    /**
     * The byte offset of this mesh's vertex data in a vertex buffer (if any).
     */
    public vertexBufferOffset?: number;

    /**
     * The byte offset of this mesh's index data in an element buffer (if any).
     */
    public elementBufferOffset?: number;

    /**
     * The byte offset of this mesh's stroke vertex data in a vertex buffer (if any).
     */
    public strokeVertexBufferOffset?: number;

    /**
     * The byte offset of this mesh's stroke index data in an element buffer (if any).
     */
    public strokeElementBufferOffset?: number;

   /**
     * The byte offset of this mesh's miter data in an element buffer (if any).
     */
    public miterBufferOffset?: number;

    /**
     * Creates a mesh with the specified data.
     * @param vertices the mesh vertices.
     * @param triangleIndices the indices for each triangle in the mesh.
     * @param polygonIndices the indices for each polygon in the mesh.
     * @param id an optional id for the mesh.
     * @param bounds the boundaries of the mesh.
     */
    constructor(vertices: VertexBuffer, triangleIndices?: IndexTupleBuffer, id?: string, bounds = vertices.measureBoundaries()) {
        this.vertices = vertices;
        this.triangleIndices = triangleIndices;
        this.bounds = bounds;
        this.id = id;
    }

    /**
     * Creates a mesh with the specified source data.
     * @param source obejct containing the data for the mesh.
     */
    static fromSpecification(spec: MeshSpecification){
        let vertices: VertexBuffer;
        let indices: IndexTupleBuffer;
        let id = spec.id;

        if(spec.vertices instanceof VertexBuffer){
            vertices = spec.vertices;
        } else if(spec.vertices instanceof Float32Array){
            vertices = new VertexBuffer(spec.vertices);
        } else if(spec.vertices) {
            vertices = new VertexBuffer(new Float32Array(spec.vertices));
        }
        
        if(spec.triangleIndices instanceof IndexTupleBuffer){
            indices = spec.triangleIndices;
        } else if(spec.triangleIndices instanceof Uint16Array){
            indices = new IndexTupleBuffer(spec.triangleIndices);
        } else if(spec.triangleIndices){
            indices = new IndexTupleBuffer(new Uint16Array(spec.triangleIndices));
        }

        switch(spec.type){
            case "polygon":
                let { sides, hasFlatTop } = spec as PolygonSpecification;
                if(!spec.vertices){
                    vertices = PolygonMesh.regularVertices(sides, hasFlatTop);
                }
                if(!spec.triangleIndices){
                    indices = PolygonMesh.regularIndices(sides || vertices.capacity());
                }
                break;
            case "star":
                let { points, ratio } = spec as StarSpecification;
                if(!spec.vertices){
                    vertices = PolygonMesh.starVertices(points, ratio);
                }
                if(!spec.triangleIndices){
                    indices = PolygonMesh.starIndices(points);
                }
                break;
            case "rectangle":
                let { bounds } = spec as RectangleSpecification;
                if(!spec.vertices){
                    vertices = PolygonMesh.rectangleVertices(bounds);
                }
                if(!spec.triangleIndices){
                    indices = PolygonMesh.regularIndices(4);
                }
                break;
            default: 
                if(!spec.vertices){
                    throw new Error(`Insufficient vertex data in specification ${spec}`);
                } 
        }

        if(spec.polygonIndices){
            return new MultiPolygonMesh(vertices, spec.polygonIndices, indices, id);
        } 

        let mesh = new PolygonMesh(vertices, indices, id);

        if(spec.effect === "spray"){
            let { innerRing, rings } = spec as SpraySpecification;
            return InstancedPolygonMesh.spray(mesh, innerRing, rings, id);
        } else {
            return mesh;
        }
    }


   /**
     * Checks if this mesh contains the specified point
     * @param pt the point to check.
     */
    contains(pt: PointLike){
        return this.contains$(pt.x, pt.y);
    }


   /**
     * Checks if this mesh contains the point (x,y).
     * @param x the x coordinate of the point.
     * @param y the y coordinate of the point.
     */
    abstract contains$(x: number, y: number): boolean;

}

export class PolygonMesh extends Mesh {

    miters: Vec2Buffer;

    /**
     * Creates a mesh with the specified data.
     * @param vertices the mesh vertices.
     * @param polygonIndices the indices for each polygon in the mesh.
     * @param triangleIndices the indices for each triangle in the mesh.
     * @param id an optional id for the mesh.
     * @param bounds the boundaries of the mesh.
     */
    constructor(vertices: VertexBuffer, triangleIndices?: IndexTupleBuffer, id?: string, bounds?: Rect) {
        super(vertices, triangleIndices, id, bounds);
        this.miters = PolygonMesh.measureMiters(vertices);
    }
    
    static measureMiters(vertices: VertexBuffer, offset = 0, count = vertices.capacity() - offset){
        let miters = Vec2Buffer.create(count);
        let previous = new VertexBuffer(vertices.data);
        let current = vertices;
        let line1 = new Vec2();
        let line2 = new Vec2();
        let last = offset + count - 1;

        // Ex: vertices (0 1 2), offset = 0, count = 3
        // (2 0 1): miter(<2,0>, <0,1>)
        // (0 1 2): miter(<0,1>, <1,2>)
        // (1 2 0): miter(<1,2>, <2,0>)

        previous.moveToPosition(last);                    // 2
        current.moveToPosition(offset)                    // 0
        line1.setFromPointToPoint(previous, current);     // <2,0>
        previous.dataPosition = current.dataPosition;     // 0

        for(let i = offset; i<last; i++){
            current.moveToNext();                         // 1, 2
            line2.setFromPointToPoint(previous, current); // <0,1>, <1,2>
            miters.rset(measureMiter(line1, line2, 1, 3)) // miter(<2,0>, <0,1>), miter(<0,1>, <1,2>)
            line1.set(line2);                             // <0,1>, <1,2>
            previous.dataPosition = current.dataPosition; // 1, 2
        }

        current.moveToFirst();                            // 0
        line2.setFromPointToPoint(previous, current);     // <2,0>
        miters.rset(measureMiter(line1, line2, 1, 3))     // miter(<1,2>, <2,0>)

        return miters;
    }

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

export class InstancedPolygonMesh extends Mesh {

    verticesPerInstance: number;

    /**
     * Creates a mesh with the specified data.
     * @param vertices the mesh vertices.
     * @param triangleIndices the indices for each triangle in the mesh.
     * @param polygonIndices the indices for each polygon in the mesh.
     * @param id an optional id for the mesh.
     * @param bounds the boundaries of the mesh.
     */
    constructor(vertices: VertexBuffer, verticesPerInstance: number, triangleIndices?: IndexTupleBuffer, id?: string, bounds?: Rect) {
        super(vertices, triangleIndices, id, bounds);
        this.verticesPerInstance = verticesPerInstance;
    }

    static spray(instance: PolygonMesh, instancesInInnerRing: number, rings: number, id?: string){
        // Create vertex buffer big enough to hold all the shapes in the spray
        let instanceVertices = instance.vertices;
        let instanceVertexCount = instanceVertices.capacity();
        let instanceCount = InstancedPolygonMesh.countInstancesInSpray(instancesInInnerRing, rings);
        let vertexCount = instanceVertexCount * instanceCount;
        let vertices = VertexBuffer.create(instanceVertexCount * instanceCount);

        // Create helper variables for placing each shape in its ring
        let angle = 2 * Math.PI / instancesInInnerRing;
        let rotation = Mat2d.rotate(angle);
        let p1 = new Point(0, 0);
        let p2 = new Point(0, 1);
        let matrix = new Mat2d();

        // Fill each ring with shapes
        for(let ring = 0; ring < rings; ring++){
            for(let shapes = instancesInInnerRing << ring; shapes > 0; shapes--){
                // Copy vertices into buffer
                let offset = vertices.position();
                instanceVertices.moveToFirst();
                vertices.rsetFromBuffer(instanceVertices);
                // Transform shape across line from p1 to p2
                Shape.stretchAcrossLine(matrix, instance, p1, p2);
                vertices.transform(matrix, offset, instanceVertexCount);
                // Position p1 and p2 for next shape in ring
                rotation.map(p1, p1);
                rotation.map(p2, p2);
            }
            // Push p1 and p2 onto the next ring
            p1.y++;
            p2.y++;
            // Halve the rotation angle, doubling the number of shapes on the subsequent ring
            rotation.setRotate(angle *= 0.5);
        }

        // Create index buffer big enough to hold all the indices
        let instanceIndices = instance.triangleIndices;
        let instanceTriangleCount = instanceIndices.capacity();
        let indices = IndexTupleBuffer.create(instanceTriangleCount * instanceCount);
        
        // Copy indices repeatedly to buffer, offseting according to position
        for(let offset = 0; offset<vertexCount; offset+= instanceVertexCount){
            instanceIndices.moveToPosition(-1);
            while(instanceIndices.moveToNext()){
                indices.set(instanceIndices);
                indices.add$(offset,offset,offset);
                indices.moveToNext();
            }
        }

        return new InstancedPolygonMesh(vertices, instanceVertexCount, indices, id);
    }
    
    private static countInstancesInSpray(shapesInInnerRing: number, rings: number){
        //Note: uses the formula for the sum of the first n terms of a geometric series
        //(3,2) -> 3*1 + 3*2 = 3(2^0 + 2^1) = 3*(1-2^2)/(1-2) = 3*(-3/-1) = 3*3 = 9;
        //(3,3) -> 3*1 + 3*2 + 3*4 = 3(2^0 + 2^1 + 2^2) = 3*(1-2^3)/(1-2) = 3*(-7/-1) = 21;
        //(m,n) -> m*2^0 + ... + m*2^(n-1) = m*(1-2^n)/(1-2) = m*(1-2^n)/(-1) = m*(2^n - 1)
        return shapesInInnerRing * ((1<<rings) - 1);
    }

    contains$(x: number, y: number){
        if(this.bounds.contains$(x, y)){
            let vertices = this.vertices;
            let vertexCount = vertices.capacity();
            let verticesPerInstance = this.verticesPerInstance;
            for(let offset = 0; offset<vertexCount; offset+=verticesPerInstance){
                if(vertices.contains$(x, y, offset, verticesPerInstance)){
                    return vertices.moveToLast();
                }
            }
        }
        return false;
    }

} 

export class MultiPolygonMesh extends Mesh {

   /**
     * The indices for each polygon in this mesh.
     */
    public polygonIndices?: number[][];

    /**
     * Creates a mesh with the specified data.
     * @param vertices the mesh vertices.
     * @param polygonIndices the indices for each polygon in the mesh.
     * @param triangleIndices the indices for each triangle in the mesh.
     * @param id an optional id for the mesh.
     * @param bounds the boundaries of the mesh.
     */
    constructor(vertices: VertexBuffer, polygonIndices?: number[][], triangleIndices?: IndexTupleBuffer, id?: string, bounds?: Rect) {
        super(vertices, triangleIndices, id, bounds);
        this.polygonIndices = polygonIndices;
    }

    static measureMiters(vertices: VertexBuffer, polygonIndices: number[][]){
        let count = 0;
        for(let indices of polygonIndices){
            count += indices.length;
        }

        let miters = Vec2Buffer.create(count);
        let previous = new VertexBuffer(vertices.data);
        let current = vertices;
        let line1 = new Vec2();
        let line2 = new Vec2();
        let last: number;

        for(let indices of polygonIndices){

            last = indices.length - 1;
            previous.moveToPosition(indices[last]);                    
            current.moveToPosition(indices[0])                    
            line1.setFromPointToPoint(previous, current);     
            previous.dataPosition = current.dataPosition;     

            for(let i = 1; i<last; i++){
                current.moveToPosition(indices[i]);                       
                line2.setFromPointToPoint(previous, current); 
                miters.rset(measureMiter(line1, line2, 1, 3)) 
                line1.set(line2);                             
                previous.dataPosition = current.dataPosition; 
            }

            current.moveToPosition(indices[0]);                           
            line2.setFromPointToPoint(previous, current);     
            miters.rset(measureMiter(line1, line2, 1, 3))     
        }

        return miters;
    }

    contains$(x: number, y: number){
        if(this.bounds.contains$(x, y)){
           for(let indices of this.polygonIndices){
                if(this.vertices.indexedContains$(x, y, indices)){
                    return this.vertices.moveToLast();
                }
            }
        }
        return false;
    }
    
} 
