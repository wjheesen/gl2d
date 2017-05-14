import { Mesh } from '../graphic/mesh';
import { Point } from "../struct/point";


export class ShapeMesh extends Mesh {

    /**
     * The point that remains fixed when stretch rotating the shape.
     */
    public pivot = new Point();

    /**
     * The point that determines the length and direction of the line for stretch rotating the shape.
     */
    public control = new Point();

    /**
     * The byte offset of this mesh's index data in an element buffer. Defaults to 0.
     */
    public elementBufferOffset = 0;

    /**
     * The byte offset of this mesh's vertex data in a vertex buffer. Defaults to 0.
     */
    public vertexBufferOffset = 0;

}