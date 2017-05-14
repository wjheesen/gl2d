import {Program} from '../rendering/program';
import {LineStruct} from '../struct/line';
import {ColorFStruct} from '../struct/colorf';
import {Mat4Struct} from '../struct/mat4';
import * as Util from '../rendering/util';
import * as Shader from '../shader/line';

/**
 * Program for rendering lines.
 */
export class LineProgram extends Program<Shader.Uniforms, Shader.Attributes> {
    
    positionBuffer: WebGLBuffer;

    static create(gl: WebGLRenderingContext) {
        let program = new LineProgram();
        program.location = Util.createProgramFromSources(gl, Shader.vertex, Shader.fragment);
        program.uniforms = Util.getUniformLocations(gl, program.location, Shader.UniformRenaming) as Shader.Uniforms;
        program.attribs = Util.getAttributeLocations(gl, program.location, Shader.AttributeRenaming) as Shader.Attributes;
        program.positionBuffer = Util.createArrayBuffer(gl, new Float32Array([0, 0.5, 0, -0.5, 1, -0.5, 1, 0.5]));
        return program;
    }

    bind (gl: WebGLRenderingContext) {
        // Bind program
        gl.useProgram(this.location);
        // Enable blending (for transparency)
        gl.enable(gl.BLEND);
        // Bind position buffer (model data)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribs.position);
    }

    /**
     * Sets this program's projection matrix.
     */
    setProjection(gl: WebGLRenderingContext, projection: Mat4Struct) {
        gl.uniformMatrix4fv(this.uniforms.projection, false, projection.data);
    }

    /**
     * Sets this program's draw color.
     */
    setColor(gl: WebGLRenderingContext, color: ColorFStruct) {
        gl.uniform4fv(this.uniforms.color, color.data);
    }

   /**
     * Sets the thickness of the lines this program will draw.
     */
    setThickness(gl: WebGLRenderingContext, thickness: number) {
        gl.uniform1f(this.uniforms.thickness, thickness);
    }

    /**
     * Sets the position of the line segment this program will draw.
     */
    setLine(gl: WebGLRenderingContext, line: LineStruct) {
        gl.uniform4fv(this.uniforms.line, line.data);
    }

    /**
     * Draws a line using the color, position, and thickness data loaded into the program. 
     */
    draw (gl: WebGLRenderingContext) {
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
}