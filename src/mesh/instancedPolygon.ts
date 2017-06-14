import { Shape } from '../drawable/shape';
import { Point } from '../struct/point';
import { Mat2d } from '../struct/mat2d';
import { PolygonMesh } from './polygon';
import { Rect } from '../struct/rect';
import { IndexTupleBuffer } from '../struct/indexTuple';
import { VertexBuffer } from '../struct/vertex';
import { Mesh } from './mesh';

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
        let vertices = instance.vertices;
        let vertexCount = vertices.capacity();
        let instanceCount = InstancedPolygonMesh.countInstancesInSpray(instancesInInnerRing, rings);
        let totalVertexCount = vertexCount * instanceCount;
        let vertexBuffer = VertexBuffer.create(vertexCount * instanceCount);

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
                let offset = vertexBuffer.position();
                vertices.moveToFirst();
                vertexBuffer.putBuffer(vertices);
                // Transform shape across line from p1 to p2
                Shape.stretchAcrossLine(matrix, instance, p1, p2);
                vertexBuffer.transform(matrix, offset, vertexCount);
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
        let indices = instance.triangleIndices;
        let indexCount = indices.capacity();
        let indexBuffer = IndexTupleBuffer.create(indexCount * instanceCount);
        
        // Copy indices repeatedly to buffer, offseting according to position
        for(let offset = 0; offset<totalVertexCount; offset+= vertexCount){
            indices.moveToPosition(-1);
            while(indices.moveToNext()){
                indexBuffer.set(indices);
                indexBuffer.add$(offset,offset,offset);
                indexBuffer.moveToNext();
            }
        }

        return new InstancedPolygonMesh(vertices, vertexCount, indices, id);
    }
    
    private static countInstancesInSpray(shapesInInnerRing: number, rings: number){
        //Note: uses the formula for the sum of the first n terms of a geometric series:
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