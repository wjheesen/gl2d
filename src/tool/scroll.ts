import { _Surface } from '../rendering/surface';
import { ScrollAction } from '../action/scroll';
import { Tool } from './tool';

export type ScrollTool<S extends _Surface> = Tool<ScrollAction<S>>

export type _ScrollTool = ScrollTool<_Surface>