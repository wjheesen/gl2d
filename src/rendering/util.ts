export type ArraySize = number | ArrayBuffer | ArrayBufferView;
export type ElementArraySize = number | ArrayBuffer | Uint8Array | Uint16Array;

/**
 * Maps the name of a uniform or attribute to it's minified renaming. 
 */
export interface Renaming {
    [key: string]: string;
}

/**
 * Maps the name of a uniform to its location in a WebGL program.
 */
export interface UniformLocations {
    [key: string]: WebGLUniformLocation;
}

/**
 * Maps the name of an attribute to its location in a WebGL program.
 */
export interface AttribLocations {
    [key: string]: number;
}

/**
 * Creates an array buffer with the specified size.
 * @param gl the WebGL context.
 * @param size the size of the array buffer, or the initial data for the buffer.
 * @param usage one of gl.STATIC_DRAW (often used, seldom changed), gl.DYNAMIC_DRAW (often used, often changed), or gl.STREAM_DRAW (seldom used).
 */
export function createArrayBuffer(gl: WebGLRenderingContext, size: ArraySize, usage = gl.STATIC_DRAW) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, size, usage);
    return buffer;
}

/**
 * Creates an element buffer with the specified size.
 * @param gl the WebGL context.
 * @param size the size of the element buffer, or the initial data for the buffer.
 * @param usage one of gl.STATIC_DRAW (often used, seldom changed), gl.DYNAMIC_DRAW (often used, often changed), or gl.STREAM_DRAW (seldom used).
 */
export function createElementBuffer(gl: WebGLRenderingContext, size: ElementArraySize, usage = gl.STATIC_DRAW) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, size, usage);
    return buffer;
}

/**
 * Creates a program from 2 shaders.
 * @param  gl the WebGL context.
 * @param  vertexShaderSource string containing code for the vertex shader.
 * @param  fragmentShaderSource string containing code for the fragment shader.
 * @returns the program.
 */
export function createProgramFromSources(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    // Compile vertex and fragment shader
    let vs = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fs = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    // Create program and return
    return createProgramFromShaders(gl, vs, fs);
};

/**
 * Creates a program from 2 shaders.
 * @param  gl rhe WebGL context.
 * @param  vertexShader a compiled vertex shader.
 * @param  fragmentShader a compiled fragment shader.
 * @returns the program.
 */
export function createProgramFromShaders(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    // create a program.
    var program = gl.createProgram();

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw ("program filed to link:" + gl.getProgramInfoLog(program));
    }

    return program;
};

/**
 * Creates and compiles a shader.
 * @param gl the WebGL Context.
 * @param shaderSource the GLSL source code for the shader.
 * @param shaderType the type of shader, VERTEX_SHADER or FRAGMENT_SHADER.
 * @returns the shader.
 */
export function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // Something went wrong during compilation; get the error
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
}

/**
 * Gets the location of each of the uniforms associated with the specified program.
 */
export function getUniformLocations(gl: WebGLRenderingContext, program: WebGLProgram, renamed?: Renaming){
    let uniforms = <UniformLocations> {};
    if(renamed){
        for(let name in renamed){
            uniforms[name] = gl.getUniformLocation(program, renamed[name]);
        }
    } else {
        let count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < count; i++) {
            let { name } = gl.getActiveUniform(program, i);
            uniforms[name] = gl.getUniformLocation(program, name);
        }
    }
    return uniforms;
}

/**
 * Gets the location of each of the attributes associated with the specified program.
 */
export function getAttributeLocations(gl: WebGLRenderingContext, program: WebGLProgram, renamed?: Renaming){
    let attribs = <AttribLocations> {};
    if(renamed){
        for(let name in renamed){
            attribs[name] = gl.getAttribLocation(program, renamed[name]);
        }
    } else {
        let count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < count; i++) {
            let { name } = gl.getActiveAttrib(program, i);
            attribs[name] = gl.getAttribLocation(program, name);
        }
    }
    return attribs;
}

