import { _Surface } from '../rendering/surface';

export interface Action<S extends _Surface, E extends Event> {

    /**
     * The surface targeted by this action.
     */
    target: S; 

    /**
     * The event that triggered this action.
     */
    src: E;

}

export type _Action = Action<_Surface, Event>;
