import {Program} from '../rendering/program';
import {Mat2d} from '../struct/mat2d'
import {ColorF} from '../struct/colorf'
import {Mat4} from '../struct/mat4'
import {Vertex} from '../struct/vertex'
import {IndexTuple} from '../struct/indextuple'
import {Mesh} from '../graphics/mesh'
import * as Shader from '../shader/shape';
import * as Util from '../rendering/util';

/**
 * Program for rendering shapes.
 */
export class ShapeProgram extends Program<Shader.Uniforms, Shader.Attributes> {

    elementBuffer: WebGLBuffer;
    positionBuffer: WebGLBuffer;

    /**
     * The number of elements to render. Varies based on mesh.
     */
    private elementCount = 0;

    /**
     * The byte offset of the first element to render. Varies based on mesh.
     */
    private elementOffset = 0;

    /**
     * Creates a program that can render polygons corresponding to each of the meshs in the specified array.
     */
    static create(gl: WebGLRenderingContext, meshes: Mesh[]) {
        let program = new ShapeProgram();
        program.location = Util.createProgramFromSources(gl, Shader.vertex, Shader.fragment);
        program.uniforms = Util.getUniformLocations(gl, program.location, Shader.UniformRenaming) as Shader.Uniforms;
        program.attribs = Util.getAttributeLocations(gl, program.location, Shader.AttributeRenaming) as Shader.Attributes;
        program.positionBuffer = Util.createArrayBuffer(gl, packMeshVertices(meshes));
        program.elementBuffer = Util.createElementBuffer(gl, packMeshIndices(meshes));
        return program;
    }

    bind (gl: WebGLRenderingContext) {
        // Bind program
        gl.useProgram(this.location);
        // Disable culling (so shapes can be flipped)
        //gl.disable(gl.CULL_FACE);
        // Enable blending (for transparency)
        gl.enable(gl.BLEND);
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.attribs.a_position);
        // Bind element buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    }

    /**
     * Sets this program's projection matrix.
     */
    setProjection(gl: WebGLRenderingContext, projection: Mat4.Struct) {
        gl.uniformMatrix4fv(this.uniforms.u_projection, false, projection.data);
    }

    /**
     * Sets this program's draw color.
     */
    setColor(gl: WebGLRenderingContext, color: ColorF.Struct) {
        gl.uniform4fv(this.uniforms.u_color, color.data);
    }

    /**
     * Sets the mesh data this program will use to draw shapes.
     */
    setMesh(gl: WebGLRenderingContext, mesh: Mesh) {
        // Point to start of mesh's vertex array
        gl.vertexAttribPointer(this.attribs.a_position, 2, gl.FLOAT,
            false, 0, mesh.vertexBufferOffset);
        // Get number of elements to render
        this.elementCount = mesh.indices.data.length;
        // Get byte offset of first element in element buffer
        this.elementOffset = mesh.elementBufferOffset;
    }

   /**
     * Sets the matrix applied to shapes this program will draw.
     */
    setMatrix(gl: WebGLRenderingContext, matrix: Mat2d.Struct) {
        gl.uniformMatrix3fv(this.uniforms.u_mesh, false, matrix.data);
    }

    /**
     * Draws a shape using the color, mesh, and mesh matrix loaded into this program. 
     */
    draw (gl: WebGLRenderingContext) {
        gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, this.elementOffset);
    }
}

/**
* Packs mesh vertices into a single buffer.
* @param meshs the meshes to pack.
* @returns the packed vertices.
*/
function packMeshVertices(meshes: Mesh[]){
    // Count the total number of vertices
    let vertexCount = 0;
    for(let mesh of meshes){
        vertexCount += mesh.vertices.capacity();
    }

    // Create an vertex buffer big enough to hold all the vertices
    let packedVertices = Vertex.Buf.create(vertexCount);

    // Keep track of vertex offsets
    let bytesPerVertex = packedVertices.structLength() * packedVertices.data.BYTES_PER_ELEMENT;

    // Pack the vertices of each mesh into the buffer, saving the offset
    for (let mesh of meshes) {
        mesh.vertexBufferOffset = packedVertices.position() * bytesPerVertex;
        mesh.vertices.moveToFirst();
        packedVertices.putBuffer(mesh.vertices);
    }

    return packedVertices.data;
}

/**
* Packs mesh indices into a single buffer.
* @param meshs the meshes to pack.
* @returns the packed indices.
*/
function packMeshIndices(meshes: Mesh[]) {

    // Count the total number of index tuples
    let indexTupleCount = 0;
    for(let mesh of meshes){
        indexTupleCount += mesh.indices.capacity();
    }

    // Create an index tuple buffer big enough to hold all the indices
    let packedIndices = IndexTuple.Buf.create(indexTupleCount);

    // Keep track of vertex offsets
    let bytesPerIndexTuple = packedIndices.structLength() * packedIndices.data.BYTES_PER_ELEMENT;

    // Pack the vertices of each mesh into the buffer, saving the offset
    for (let mesh of meshes) {
        mesh.elementBufferOffset = packedIndices.position() * bytesPerIndexTuple;
        mesh.indices.moveToFirst();
        packedIndices.putBuffer(mesh.indices);
    }

    return packedIndices.data;
}