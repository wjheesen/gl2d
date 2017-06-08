import { _Surface } from '../rendering/surface';
import { _SurfaceTouchEvent, SurfaceTouchEvent } from './touch';
import { _SurfaceMouseEvent, SurfaceMouseEvent } from './mouse';

export type SurfaceMouseOrTouchEvent<S extends _Surface> = SurfaceMouseEvent<S> | SurfaceTouchEvent<S>;

export type _SurfaceMouseOrTouchEvent = SurfaceMouseOrTouchEvent<_Surface>;

export function isMouseAction(action: _SurfaceMouseOrTouchEvent): action is _SurfaceMouseEvent {
        return (<_SurfaceMouseEvent>action).cursor !== undefined;
}

export function isTouchAction(action: _SurfaceMouseOrTouchEvent): action is _SurfaceTouchEvent {
    return (<_SurfaceTouchEvent>action).pointers !== undefined;
}