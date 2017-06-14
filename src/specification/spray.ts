import { MeshSpecification } from './mesh';

export interface SpraySpecification extends MeshSpecification {
    innerRing: number;
    rings: number;
}