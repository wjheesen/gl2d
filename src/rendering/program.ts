import { Renderer } from './renderer';
import { UniformLocations, AttribLocations } from './util'

export abstract class Program<R extends Renderer, U extends UniformLocations, A extends AttribLocations>{

    /**
     * The location of this program in WebGL.
     */
    location: WebGLProgram;

    /**
     * The locations of the uniforms associated with this program, keyed by the uniform name.
     */
    uniforms: U;

    /**
     * The locations of the attributes associated with this program, keyed by the attribute name.
     */
    attribs: A;

    /**
     * Called whenever this program is attached to a renderer.
     * @param renderer the renderer that attached this program.
     */
    abstract onAttach(renderer: R): any;

    /**
     * Called whenever this program is detached from a renderer.
     * @param renderer the renderer that detached this program.
     */
    abstract onDetach(renderer: R): any;
}

export type _Program = Program<Renderer, UniformLocations, AttribLocations>;
