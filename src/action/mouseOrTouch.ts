import { _Surface } from '../rendering/surface';
import { _TouchAction, TouchAction } from './touch';
import { _MouseAction, MouseAction } from './mouse';

export type MouseOrTouchAction<S extends _Surface> = MouseAction<S> | TouchAction<S>;

export type _MouseOrTouchAction = MouseOrTouchAction<_Surface>;

export function isMouseAction(action: _MouseOrTouchAction): action is _MouseAction {
        return (<_MouseAction>action).cursor !== undefined;
}

export function isTouchAction(action: _MouseOrTouchAction): action is _TouchAction {
    return (<_TouchAction>action).pointers !== undefined;
}