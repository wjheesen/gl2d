import { _Surface } from '../rendering/surface';
import { SurfaceWheelEvent } from '../event/scroll';
import { Tool } from './tool';

export type ScrollTool<S extends _Surface> = Tool<SurfaceWheelEvent<S>>

export type _ScrollTool = ScrollTool<_Surface>