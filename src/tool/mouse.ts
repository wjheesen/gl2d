import { _Surface } from '../rendering/surface';
import { SurfaceMouseEvent } from '../event/mouse';
import { Tool } from './tool';

export type MouseTool<S extends _Surface> = Tool<SurfaceMouseEvent<S>>

export type _MouseTool = MouseTool<_Surface>