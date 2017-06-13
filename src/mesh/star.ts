import { MeshSpecification } from './specification';

export interface StarSpecification extends MeshSpecification {
    points: number;
    ratio: number;
}