import { _Surface } from '../rendering/surface';
import { TouchAction } from '../action/touch';
import { Tool } from './tool';

export type TouchTool<S extends _Surface> = Tool<TouchAction<S>>

export type _TouchTool = TouchTool<_Surface>