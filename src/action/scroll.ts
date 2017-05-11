import { _Surface } from '../rendering/surface';
import {Action} from './action'
import {IPoint} from '../struct/point'

export interface ScrollAction<S extends _Surface> extends Action<S, WheelEvent | MouseWheelEvent> {

    /**
     * True if scrolling uppwards; false if scrolling downwards.
     */
    isUpward: boolean;

    /**
     * The position of the cursor in world space.
     */
    cursor: IPoint;
}

export type _ScrollAction = ScrollAction<_Surface>;
