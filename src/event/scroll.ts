import { _Surface } from '../rendering/surface';
import { IPoint } from '../struct/point';
import { SurfaceEvent } from './surface';

export interface SurfaceWheelEvent<S extends _Surface> extends SurfaceEvent<S, WheelEvent | MouseWheelEvent> {

    /**
     * True if the wheel is being scrolled upwards; false if the wheel is scrolling downwards.
     */
    isUpward: boolean;

    /**
     * The position of the cursor in world space.
     */
    cursor: IPoint;
}

export type _SurfaceWheelEvent = SurfaceWheelEvent<_Surface>;
