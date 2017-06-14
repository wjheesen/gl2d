import { MeshSpecification } from './mesh';

export interface StarSpecification extends MeshSpecification {
    points: number;
    ratio: number;
}