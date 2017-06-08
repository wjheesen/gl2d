import { _Surface } from '../rendering/surface';
import { SurfaceTouchEvent } from '../event/touch';
import { Tool } from './tool';

export type TouchTool<S extends _Surface> = Tool<SurfaceTouchEvent<S>>

export type _TouchTool = TouchTool<_Surface>