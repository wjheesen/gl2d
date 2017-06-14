import { MeshSpecification } from './mesh';

export interface PolygonSpecification extends MeshSpecification {
    sides?: number;
    hasFlatTop?: boolean;
}