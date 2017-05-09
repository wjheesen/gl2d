import Camera from './camera'
import {Program_} from './program'


/**
 * Helper class for rendering graphics with WebGL.
 */
abstract class Renderer {

    /**
     * The WebGL rendering context used by this renderer.
     */
    public gl: WebGLRenderingContext;
 
    /**
     * The projection being applied by this renderer.
     */
    public camera: Camera;

    /**
     * The location of the currently bound program.
     */
    private currentProgram: Program_;

    /**
     * Creates a new rendering object. 
     * @param the WebGL rendering context to use.
     * @param camera the camera that should be used.
     */
    constructor(gl: WebGLRenderingContext, camera: Camera) {
        this.gl = gl;
        this.camera = camera;
    }

    /**
     * Called when the surface hosting this renderer is first created.
     */
    abstract onSurfaceCreated(): void;

    /**
     * Called whenever the canvas size changes.
     * @param width the new width of the canvas.
     * @param height the new height of the canvas.
     */
    onSurfaceChanged(width: number, height: number) {
        // Update the viewport to match the new dimensions of the drawing buffer
        this.gl.viewport(0, 0, width, height);
        // Adjust camera to viewport
        this.camera.setViewport(width, height);
    }

    /**
     * Called whenever the canvas needs to be re-rendered.
     */
    abstract onDrawFrame(): void;

    /**
     * Binds to the specified program, if not already bound.
     * @param program the program to bind.
     */
    useProgram(program: Program_) {
        // If the program is not already being used
        if (this.currentProgram !== program) {
            // Start using it
            program.bind(this.gl);
            // Mark it as the current program
            this.currentProgram = program;
        }
    }
};

export default Renderer;