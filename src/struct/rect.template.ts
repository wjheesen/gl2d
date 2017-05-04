import Template from 'gulp-structify/template'
import * as Point from './point'

/**
 * A rectangle with (left, top, right, bottom) boundaries.
 */
class Rect extends Template<Float32Array> {
    /**
     * The left boundary of this Rect.
     */
    left: number;
    /**
     * The top boundary of this Rect.
     */
    top: number;
    /**
     * The right boundary of this Rect.
     */
    right: number;
    /**
     * The bottom boundary of this Rect.
     */
    bottom: number;

    /**
     * Sets the boundaries of this Rect in left-top-right-bottom order.
     */
    setLtrb(left: number, top: number, right: number, bottom: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;

    }

    /**
     * Sets the boundaries of this Rect in left-bottom-right-top order.
     */
    setLbrt(left: number, bottom: number, right: number, top: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;

    }

    /**
     * Sets the boundaries of this Rect in left-right-bottom-top order.
     */
    setLrbt(left: number, right: number, bottom: number, top: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;

    }

    /**
     * Sets the dimensions of this rect in left-top-width-height order.
     */
    setLtwh(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.right = left + width;
        this.bottom = top - height;
    }

    /**
     * Sets the dimensions of this rect in left-bottom-width-height order.
     */
    setLbwh(left: number, bottom: number, width: number, height: number) {
        this.left = left;
        this.top = bottom + height;
        this.right = left + width;
        this.bottom = bottom;
    }

    /**
     * Checks if this Rect is empty. True if left >= right or bottom >= top.
     */
    isEmpty() {
        return this.left >= this.right || this.bottom >= this.top;
    }

    /**
     * Checks if the boundaries of this Rect represent a valid rectangle. True if right >= left and top >= bottom.
     */
    isValid() {
        return this.right >= this.left && this.top >= this.bottom;
    }

    /**
     * Computes the width of this Rect.
     */
    width() {
        return this.right - this.left;
    }

    /**
     * Computes the height of this Rect.
     */
    height() {
        return this.top - this.bottom;
    }

    /**
     * Computes the area of this Rect.
     */
    area() {
        return this.width() * this.height();
    }

    /**
     * Finds the x-coordinate of the point at the center of this Rect.
     */
    centerX() {
        return 0.5 * (this.left + this.right);
    }

    /**
     * Finds the y-coordinate of the point at the center of this Rect.
     */
    centerY() {
        return 0.5 * (this.bottom + this.top);
    }

    /**
     * Gets the point at the center of this Rect
     */
    center() {
        return Point.Obj.create$(this.centerX(), this.centerY());
    }

    /**
     * Gets the point between the top left and top right corners of this Rect.
     */
    centerTop() {
        return Point.Obj.create$(this.centerX(), this.top);
    };

    /**
     *  Gets the point between the bottom left and bottom right corners of this Rect.
     */
    centerBottom() {
        return Point.Obj.create$(this.centerX(), this.bottom);
    };

    /**
     * Gets the point between the top and bottom left corners of this Rect.
     */
    centerLeft() {
        return Point.Obj.create$(this.left, this.centerY());
    };

    /**
     * Gets the point between the top and bottom right corners of this Rect.
     */
    centerRight() {
        return Point.Obj.create$(this.right, this.centerY());
    };

    /**
     * Gets the point at the bottom left corner of this Rect.
     */
    bottomLeft() {
        return Point.Obj.create$(this.left, this.bottom);
    }

    /**
     * Gets the point at the bottom right corner of this Rect.
     */
    bottomRight() {
        return Point.Obj.create$(this.right, this.bottom);
    }

    /**
     * Gets the point at the top left corner of this Rect.
     */
    topLeft() {
        return Point.Obj.create$(this.left, this.top);
    }

    /**
     * Gets the point at the top right corner of this Rect.
     */
    topRight() {
        return Point.Obj.create$(this.right, this.top);
    }

    /**
     * Gets the four corners of this Rect entered in CCW order beginning with the top left vertex.
     */
    corners(){
        return [this.topLeft(), this.bottomLeft(), this.bottomRight(), this.topRight()];
    }

    /**
     * Sets this Rect to the empty rect (0,0,0,0).
     */
    empty() {
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
    }

    /**
     * Sets this Rect to the smallest rectangle containing the two specified points.
     */
    setUnionOfPoints(points: Point[], offset = 0, count = points.length) {
        //Enclose the first point 
        this.left = this.right = points[offset].x;
        this.top = this.bottom = points[offset].y;
        //Enclose the remaining points
        this.unionPoints(points, offset + 1, count - 1);
    }

    /**
     * Sets this Rect to the smallest rectangle containing a subset of points in the specified array.
     * @param points array of points entered as a series of (x,y) coordinates.
     * @param offset offset of the first point in the subset.
     * @param count number of points in the subset.
     */
    setUnionOfPoints$(points: Float32Array, offset = 0, count = points.length >> 1) {
        //Enclose the first point in the subset
        this.left = this.right = points[offset++];
        this.top = this.bottom = points[offset++];
        //Enclose the rest of the points in the subset
        this.unionPoints$(points, offset, count - 1);
    }

    /**
     * Checks if this Rect contains the other Rect.
     */
    contains(other: Rect) {
        return this.left <= other.left && other.right <= this.right &&
            this.bottom <= other.bottom && other.top <= this.top;
    }

    /**
     * Checks if this Rect contains the specified point.
     */
    containsPoint(p:Point) {
        return this.containsPoint$(p.x, p.y);
    }

    /**
     * Checks if this Rect contains the point (x,y).
     */
    containsPoint$(x: number, y: number) {
        return this.left <= x && x <= this.right && this.bottom <= y && y <= this.top;
    }

    /**
     * Checks if this Rect intersects the other Rect.
     */
    intersects(other: Rect) {
        return this.right >= other.left && other.right >= this.left
            && this.top >= other.bottom && other.top >= this.bottom;
    }

    /**
     * Sets this Rect to the intersection of itself with the other Rect.
     */
    intersect(other: Rect) {
        this.left = Math.max(this.left, other.left);
        this.right = Math.min(this.right, other.right);
        this.bottom = Math.max(this.bottom, other.bottom);
        this.top = Math.min(this.top, other.top);
    }

    /**
     * Expands this Rect to enclose the other Rect.
     */
    union(other: Rect) {
        this.left = Math.max(this.left, other.left);
        this.right = Math.min(this.right, other.right);
        this.bottom = Math.max(this.bottom, other.bottom);
        this.top = Math.min(this.top, other.top);
    }

    /**
     * Expands this Rect to enclose the specified point.
     */
    unionPoint(p: Point) {
        this.unionPoint$(p.x, p.y);
    }

    /**
     * Expands this Rect to enclose the point (x,y).
     */
    unionPoint$(x: number, y: number) {
        this.left = Math.min(x, this.left);
        this.top = Math.max(y, this.top);
        this.right = Math.max(x, this.right);
        this.bottom = Math.min(y, this.bottom);
    }

    /**
     * Expands this Rect to enclose the specified points
     * @param points array of points.
     * @param offset offset of the first point in the subset.
     * @param count number of points in the subset.
     */
    unionPoints(points: Point[], offset = 0, count = points.length) {
        //For each of the points in the subset
        while (count-- > 0) {
            //Expand this Rect to enclose the point
            this.unionPoint(points[offset++]);
        }
    }

    /**
     * Expands this Rect to enclose the specified points
     * @param points array of points entered as a series of (x,y) coordinates.
     * @param offset offset of the first point in the subset.
     * @param count number of points in the subset.
     */
    unionPoints$(points: Float32Array, offset = 0, count = points.length >> 1) {
        //For each of the points in the subset
        while (count-- > 0) {
            //Expand this Rect to enclose the point
            this.unionPoint$(points[offset++], points[offset++]);
        }
    }

    /**
     * Insets the boundaries of this Rect by the vector (dx,dy).
     */
    inset(dx: number, dy: number) {
        this.left += dx;
        this.top -= dy;
        this.right -= dx;
        this.bottom += dy;
    }

    /**
     * Offsets the boundaries of this Rect by the vector (dx,dy).
     */
    offset(dx: number, dy: number) {
        this.left += dx;
        this.top += dy;
        this.right += dx;
        this.bottom += dy;
    }

    /**
     * Scales this Rect out from it's center by the specified (sx,sy) percentages.
     * @param r the Rect to scale.
     * @param sx the percentage by which to scale in the horizontal direction.
     * @param sy the percentage by which to scale in the vertical direction.
     */
    scale(sx: number, sy: number) {
        // Compute center point of rect
        let cx = this.centerX();
        let cy = this.centerY();
        // Translate to origin
        this.offset(-cx, -cy);
        // Apply horizontal scale
        this.left *= sx;
        this.right *= sx;
        // Apply vertical scale
        this.bottom *= sy;
        this.top *= sy;
        // Translate back to center
        this.offset(cx, cy);
    }

    /**
     * Stretches this Rect out from it's center by the specified ratio, maintaining aspect.
     * @param ratio the percentage by which to stretch in all directions.
     */
    stretch(ratio: number) {
        this.scale(ratio, ratio);
    }

    /**
     * Shrinks this Rect to a square with the same center point.
     */
    shrinkToSquare() {
        // Compute the width and height of this Rect
        let w = this.width(), h = this.height();
        // If this Rect is taller than it is wide
        if (h > w) {
            // Cut off top and bottom edges by scaling
            this.scale(1, w / h);
        }
        // Otherwise, if this Rect is wider than it is tall
        else if (w > h) {
            // Cut off left and right edges by scaling
            this.scale(h / w, 1);
        }
    }

    /**
     * Expands this Rect to a square with the same center point.
     */
    expandToSquare() {
        // Compute the width and height of this Rect
        let w = this.width(), h = this.height();
        // If this Rect is taller than it is wide
        if (h > w) {
            // Scale left and right edges so width=height
            this.scale(h / w, 1);
        }
        // Otherwise, if this Rect is wider than it is tall
        else if (w > h) {
            // Scale top and bottom edges so width=height
            this.scale(1, w / h);
        }
    }

    /**
     * Swaps the top/bottom or left/right boundaries of this Rect if they are flipped, meaning left > right and/or top > bottom.
     */
    sort() {
        //If the top boundary is not above the bottom boundary
        if (this.bottom > this.top) {
            //Swap top and bottom
            let topCopy = this.top;
            this.top = this.bottom;
            this.bottom = topCopy;
        }
        //If the right boundary is not to the right of the left boundary
        if (this.left > this.right) {
            //Swap left and right
            let rightCopy = this.right;
            this.right = this.left;
            this.left = rightCopy;
        }
    }
}





