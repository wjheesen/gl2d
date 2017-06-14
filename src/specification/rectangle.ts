import { RectLike } from '../struct/rect';
import { MeshSpecification } from './mesh';

export interface RectangleSpecification extends MeshSpecification {
    bounds?: RectLike;
}