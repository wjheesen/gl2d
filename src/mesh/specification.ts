import { IndexTupleBuffer } from '../struct/indexTuple';
import { VertexBuffer } from '../struct/vertex';

export interface MeshSpecification {
    id?: string;
    type?: string;
    vertices?: number[] | Float32Array | VertexBuffer; 
    indices?: number[] | Uint16Array | IndexTupleBuffer;
}