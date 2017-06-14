import { MeshSpecification } from '../specification/mesh';
import { PolygonSpecification } from '../specification/polygon';
import { RectangleSpecification } from '../specification/rectangle';
import { SpraySpecification } from '../specification/spray';
import { StarSpecification } from '../specification/star';
import { IndexTupleBuffer } from '../struct/indextuple';
import { PointLike } from '../struct/point';
import { Rect } from '../struct/rect';
import { VertexBuffer } from '../struct/vertex';
import { InstancedPolygonMesh } from './instancedPolygon';
import { MultiPolygonMesh } from './multiPolygon';
import { PolygonMesh } from './polygon';

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
     * The indices for each triangle in this mesh.
     */
    public triangleIndices?: IndexTupleBuffer;

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
        } else {
            let mesh = new PolygonMesh(vertices, indices, id);
            if(spec.effect === "spray"){
                let { innerRing, rings } = spec as SpraySpecification;
                return InstancedPolygonMesh.spray(mesh, innerRing, rings, id);
            } else {
                return mesh;
            }
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
