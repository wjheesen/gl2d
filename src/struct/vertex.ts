﻿import { IVec2, Vec2Buffer, Vec2 } from '../struct/vec2'
import { IPoint } from '../struct/point'
import {IMat2d} from '../struct/mat2d'
import {Rect} from '../struct/rect'

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
     * Gets the coordinates of the vertex at the specified position without changing the position of this buffer.
     * @param position the position of the vertex in this buffer.
     * @param dst where to write the coordinates. Defaults to new Vec2.
     * @returns dst.
     */
    get(position: number, dst: IVec2 = new Vec2()){
        let dataPosition = position * this.structLength();
        dst.x = this.data[dataPosition];
        dst.y = this.data[dataPosition+1];
        return dst;
    }

    /**
     * Gets the coordinates of the next vertex in this buffer, increasing its position by one.
     * @param dst where to write the coordinates. Defaults to new Vec2.
     * @returns dst.
     */
    next(dst: IVec2 = new Vec2()){
        dst.x = this.data[this.dataPosition++];
        dst.y = this.data[this.dataPosition++];
        return dst;
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
     * Checks if a subset of vertices in this buffer contain the specified point.
     * @param pt the point to check. 
     * @param offset the offset of the first vertex in the subset.
     * @param count the number of vertices in the subset.
     */
    contains(pt: IPoint, offset = 0, count = this.capacity() - offset) {
        return this.contains$(pt.x, pt.y, offset, count);
    }

    /**
     * Checks if a subset of vertices in this buffer contain the point (x,y).
     * @param x the x coordinate of the point to check.
     * @param y the y coordinate of the point to check.
     * @param offset the offset of the first vertex in the subset.
     * @param count the number of vertices to include.
     */
    contains$(x: number, y: number, offset = 0, count = this.capacity() - offset) {
        //Assume the point is not inside the subset
        let inside = false;

        this.forEachEdge((x1, y1, x2, y2) => {
            if ((y1 > y) !== (y2 > y) && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1) {
                inside = !inside;
            }
        }, offset, count);

        return inside;
    }

    /**
     * Offsets the specified vertices in this buffer by the specified vector.
     * @param offset the offset of the first vertex.
     * @param count the number of vertices to include.
     */
    offset(vec: IVec2, offset = 0, count = this.capacity() - offset) {
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
    transform(matrix: IMat2d, offset = 0, count = this.capacity() - offset) {
        IMat2d.mapPoints$(matrix, this.data, offset * this.structLength());
    }

    /**
     * Invokes the callback function on each of the specified edges of this vertex buffer. 
     * @param callback the callback function.
     * @param offset the offset of the first edge.
     * @param count the number of edges to include. 
     */
    forEachEdge(callback: (x1: number, y1: number, x2: number, y2: number) => void, offset = 0, count = this.capacity() - offset) {
        let data = this.data;
        let dataIndex = offset * this.structLength();
        let stoppingIndex = (offset + count) * this.structLength();
        let startX = data[stoppingIndex - 2];
        let startY = data[stoppingIndex - 1];
        let endX: number;
        let endY: number;
        while (dataIndex < stoppingIndex) {
            endX = data[dataIndex++];
            endY = data[dataIndex++];
            callback(startX, startY, endX, endY);
            startX = endX;
            startY = endY;
        }
    }
}