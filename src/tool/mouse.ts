import { _Surface } from '../rendering/surface';
import { MouseAction } from '../action/mouse';
import { Tool } from './tool';

export type MouseTool<S extends _Surface> = Tool<MouseAction<S>>

export type _MouseTool = MouseTool<_Surface>