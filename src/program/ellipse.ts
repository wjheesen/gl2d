import {Program} from '../rendering/program';
import {RectStruct} from '../struct/rect';
import {ColorFStruct} from '../struct/colorf';
import {Mat4Struct} from '../struct/mat4';
import * as Util from '../rendering/util';
import * as Shader from '../shader/ellipse';

/**
 * Program for rendering ellipses.
 */
export class EllipseProgram extends Program<Shader.Uniforms, Shader.Attributes> {

    basisCoords: WebGLBuffer;

    static create(gl: WebGLRenderingContext) {
        let program = new EllipseProgram();
        program.location = Util.createProgramFromSources(gl, Shader.vertex, Shader.fragment);
        program.uniforms = Util.getUniformLocations(gl, program.location, Shader.UniformRenaming) as Shader.Uniforms;
        program.attribs = Util.getAttributeLocations(gl, program.location, Shader.AttributeRenaming) as Shader.Attributes;
        program.basisCoords = Util.createArrayBuffer(gl, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]));
        return program;
    }

    bind(gl: WebGLRenderingContext) {
        // Bind program
        gl.useProgram(this.location);
        // Enable blending (for transparency)
        gl.enable(gl.BLEND);
        // Bind tex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.basisCoords);
        gl.vertexAttribPointer(this.attribs.basisCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribs.basisCoord);
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
     * Sets the boundaries of the ellipse to draw.
     * @param bounds the boundaries of the ellipse.
     */
    setEllipse(gl: WebGLRenderingContext, ellipse: RectStruct) {
        gl.uniform4fv(this.uniforms.bounds, ellipse.data); 
    }

    /**
     * Draws an ellipse using the color and bounds data loaded into the program. 
     */
    draw(gl: WebGLRenderingContext){
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);;
    }
}