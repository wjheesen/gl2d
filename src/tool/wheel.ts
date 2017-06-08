import { _Surface } from '../rendering/surface';
import { SurfaceWheelEvent } from '../event/scroll';
import { Tool } from './tool';

export type WheelTool<S extends _Surface> = Tool<SurfaceWheelEvent<S>>

export type _WheelTool = WheelTool<_Surface>