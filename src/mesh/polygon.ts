import { MeshSpecification } from './specification';

export interface PolygonSpecification extends MeshSpecification {
    sides?: number;
    hasFlatTop?: boolean;
}