import { RectLike } from '../struct/rect';
import { IndexTupleBuffer } from '../struct/indexTuple';
import { VertexBuffer } from '../struct/vertex';

export interface MeshSpecification {
    id?: string;
    type?: string;
    effect?: string;
    vertices?: number[] | Float32Array | VertexBuffer; 
    triangleIndices?: number[] | Uint16Array | IndexTupleBuffer;
    polygonIndices?: number[][];
    bounds?: RectLike;
}