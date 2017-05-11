import {Program} from '../rendering/program';
import {Mesh} from '../graphics/mesh'
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
    elementBuffer: WebGLBuffer;

    static create(gl: WebGLRenderingContext) {
        let program = new EllipseProgram();
        program.location = Util.createProgramFromSources(gl, Shader.vertex, Shader.fragment);
        program.uniforms = Util.getUniformLocations(gl, program.location, Shader.UniformRenaming) as Shader.Uniforms;
        program.attribs = Util.getAttributeLocations(gl, program.location, Shader.AttributeRenaming) as Shader.Attributes;
        program.basisCoords = Util.createArrayBuffer(gl, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]));
        program.elementBuffer = Util.createElementBuffer(gl, Mesh.polygonIndices(4).data);
        return program;
    }

    bind(gl: WebGLRenderingContext) {
        // Bind program
        gl.useProgram(this.location);
        // Enable blending (for transparency)
        gl.enable(gl.BLEND);
        // Bind tex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.basisCoords);
        gl.vertexAttribPointer(this.attribs.a_basisCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribs.a_basisCoord);
        // Bind element buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    }

    /**
     * Sets this program's projection matrix.
     */
    setProjection(gl: WebGLRenderingContext, projection: Mat4Struct) {
        gl.uniformMatrix4fv(this.uniforms.u_projection, false, projection.data);
    }

    /**
     * Sets this program's draw color.
     */
    setColor(gl: WebGLRenderingContext, color: ColorFStruct) {
        gl.uniform4fv(this.uniforms.u_color, color.data);
    }

    /**
     * Sets the boundaries of the ellipse to draw.
     * @param bounds the boundaries of the ellipse.
     */
    setEllipse(gl: WebGLRenderingContext, ellipse: RectStruct) {
        gl.uniform4fv(this.uniforms.u_bounds, ellipse.data); 
    }

    /**
     * Draws an ellipse using the color and bounds data loaded into the program. 
     */
    draw(gl: WebGLRenderingContext){
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}