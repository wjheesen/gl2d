import { Mat2d } from '../struct/mat2d';
import { PointLike } from '../struct/point';
import { Rect } from '../struct/rect';
import { Vec2Buffer, Vec2Like } from '../struct/vec2';

 /**
  * Helper class for working with vertex data stored in a Float32Array.
  */
export class VertexBuffer extends Vec2Buffer {

    /**
     * Creates an empty VertexBuf with the specified vertex capacity.
     */
    static create(capacity: number) {
        return new VertexBuffer(new Float32Array(capacity * 2));
    }

    /**
     * Measures the boundaries of a subset of vertices in this buffer.
     * @param offset the offset of the first vertex in the subset.
     * @param count the number of vertices in the subset.
     */
    measureBoundaries(offset = 0, count = this.capacity() - offset) {
        return Rect.unionOfPoints$(this.data, offset * this.structLength(), count);
    }

    /**
     * Checks if a polygon (specified by indices into this buffer) contains the specified point.
     * @param pt the point to check.
     * @param polygonIndices the indices for each of the polygons.
     */
    indexedContains(pt: PointLike, polygonIndices: number[]){
        return this.indexedContains$(pt.x, pt.y, polygonIndices);
    }

    /**
     * Checks if a polygon (specified by indices into this buffer) contains the specified point.
     * @param x the x coordinate of the point to check.
     * @param y the y coordinate of the point to check.
     * @param polygonIndices the indices for each of the polygons.
     */
    indexedContains$(x: number, y: number, polygonIndices: number[]){

        // Assume the point is not inside the polygon
        let inside = false;

        // Helper vars:
        let prevX: number; let prevY: number;
        let currX: number; let currY: number;
        let vertexCount = polygonIndices.length;

        // Get last point in subset
        this.moveToPosition(polygonIndices[vertexCount - 1]);
        prevX = this.x; prevY = this.y;

        // Check point against each side of polygon
        for(let i = 0; i<vertexCount; i++){
            this.moveToPosition(polygonIndices[i]);
            currX = this.x;  currY = this.y;
            if(isInside(x,y, prevX, prevY, currX, currY)){
                inside = !inside;
            }
            prevX = currX; prevY = currY;
        }

        return inside;
    }

    /**
     * Checks if a polygon (specified by a subset of vertices in this buffer) contains the specified point.
     * @param pt the point to check. 
     * @param offset the offset of the first polygon vertex. Defaults to zero.
     * @param count the number of polygon vertices. Defaults to the number of vertices in this buffer.
     */
    contains(pt: PointLike, offset?: number, count?: number) {
        return this.contains$(pt.x, pt.y, offset, count);
    }

    /**
     * Checks if a polygon (specified by a subset of vertices in this buffer) contains the specified point.
     * @param x the x coordinate of the point to check.
     * @param y the y coordinate of the point to check.
     * @param offset the offset of the first polygon vertex. Defaults to zero.
     * @param count the number of polygon vertices. Defaults to the number of vertices in this buffer.
     */
    contains$(x: number, y: number, offset = 0, count = this.capacity() - offset) {

        //Assume the point is not inside the subset
        let inside = false;

        // Helper vars:
        let prevX: number; let prevY: number;
        let currX: number; let currY: number;

        // Get last point in subset
        this.moveToPosition(offset + count - 1);
        prevX = this.x; prevY = this.y;

        // Check point against each side of polygon
        while(count-- > 0){
            this.moveToPosition(offset++);
            currX = this.x; currY = this.y;
            if(isInside(x, y, prevX, prevY, currX, currY)){
                 inside = !inside; 
            }
            prevX = currX; prevY = currY;
        }

        return inside;
    }

    /**
     * Offsets the specified vertices in this buffer by the specified vector.
     * @param offset the offset of the first vertex.
     * @param count the number of vertices to include.
     */
    offset(vec: Vec2Like, offset?: number, count?: number) {
        this.offset$(vec.x, vec.y, offset, count);
    }

    /**
     * Offsets the specified vertices in this buffer by the vector (dx,dy).
     * @param offset the offset of the first vertex.
     * @param count the number of vertices to include.
     */
    offset$(dx: number, dy: number, offset = 0, count = this.capacity() - offset) {
        //Compute the data index of the first point in the subset
        let dataIndex = offset * this.structLength();
        //Offset each of the points in the subset
        for (let i = 0; i <= count; i++) {
            this.data[dataIndex++] += dx;
            this.data[dataIndex++] += dy;
        }
    }

    /**
     * Transforms the specified vertices in this buffer by the specified matrix.
     * @param matrix the transformation matrix.
     * @param offset the offset of the first vertex.
     * @param count the number of vertices to include.
     */
    transform(matrix: Mat2d, offset = 0, count = this.capacity() - offset) {
        matrix.mapPoints$(this.data, offset * this.structLength());
    }
}

function isInside(x: number, y: number, x1: number, y1: number, x2: number, y2: number){
    return (y1 > y) !== (y2 > y) && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1;
}