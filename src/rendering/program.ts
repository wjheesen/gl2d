import { UniformLocations, AttribLocations } from './util'

export abstract class Program<U extends UniformLocations, A extends AttribLocations>{

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
     * Binds this program and any associated buffers to the specified context.
     */
    abstract bind(gl: WebGLRenderingContext): void;
}

export type _Program = Program<UniformLocations, AttribLocations>;
