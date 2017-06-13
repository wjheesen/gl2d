import { RectLike } from '../struct/rect';
import { MeshSpecification } from './specification';

export interface RectangleSpecification extends MeshSpecification {
    bounds?: RectLike;
}