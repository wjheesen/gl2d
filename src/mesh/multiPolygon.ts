import { Rect } from '../struct/rect';
import { IndexTupleBuffer } from '../struct/indexTuple';
import { VertexBuffer } from '../struct/vertex';
import { Mesh } from './mesh';

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