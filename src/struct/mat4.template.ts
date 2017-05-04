import Template from 'gulp-structify/template'
import * as Rect from './rect';

/**
 * A 4x4 matrix.
 */
class Mat4 extends Template<Float32Array>{
    /**
     * The first entry in the first column of this Mat4.
     */
    c1r1: number;
    /**
     * The second entry in the first column of this Mat4.
     */
    c1r2: number;
    /**
     * The third entry in the first column of this Mat4.
     */
    c1r3: number;
    /**
     * The fourth entry in the first column of this Mat4.
     */
    c1r4: number;
    /**
     * The first entry in the second column of this Mat4.
     */
    c2r1: number;
    /**
     * The second entry in the second column of this Mat4.
     */
    c2r2: number;
    /**
     * The third entry in the second column of this Mat4.
     */
    c2r3: number;
    /**
     * The fourth entry in the second column of this Mat4.
     */
    c2r4: number;
    /**
     * The first entry in the third column of this Mat4.
     */
    c3r1: number;
    /**
     * The second entry in the third column of this Mat4.
     */
    c3r2: number;
    /**
     * The third entry in the third column of this Mat4.
     */
    c3r3: number;
    /**
     * The fourth entry in the third column of this Mat4.
     */
    c3r4: number;
    /**
     * The first entry in the fourth column of this Mat4.
     */
    c4r1: number;
    /**
     * The second entry in the fourth column of this Mat4.
     */
    c4r2: number;
    /**
     * The third entry in the fourth column of this Mat4.
     */
    c4r3: number;
    /**
     * The fourth entry in the fourth column of this Mat4.
     */
    c4r4: number;

    /**
      * Sets this Mat4 to an othogonal transformation matrix given the
      * dimensions of the near clipping plane as well as the
      * near and far clipping plane distances.
      * @param left left side of the near clipping plane viewport.
      * @param right side of the near clipping plane viewport.
      * @param top top of the near clipping plane viewport.
      * @param bottom bottom of the near clipping plane viewport.
      * @param near the depth (negative z coordinate) of the near clipping plane.
      * @param far the depth (negative z coordinate) of the far clipping plane.
      * @param dst where to store the result. Defaults to new Mat4.
      * @returns the ortho matrix.
      */
    ortho(clip: Rect, near: number, far: number) {
        this.ortho$(clip.left, clip.right, clip.bottom, clip.top, near, far);
    }

    /**
      * Sets this Mat4 to an othogonal transformation matrix given the left, right,
      * bottom, and top dimensions of the near clipping plane as well as the
      * near and far clipping plane distances.
      * @param left left side of the near clipping plane viewport.
      * @param right side of the near clipping plane viewport.
      * @param top top of the near clipping plane viewport.
      * @param bottom bottom of the near clipping plane viewport.
      * @param near the depth (negative z coordinate) of the near clipping plane.
      * @param far the depth (negative z coordinate) of the far clipping plane.
      * @param dst where to store the result. Defaults to new Mat4.
      * @returns the ortho matrix.
      */
    ortho$(left: number, right: number, bottom: number, top: number,  near: number, far: number) {

        let width = right - left,
            height = top - bottom,
            depth = near - far;

        this.c1r1 = 2 / width;
        this.c1r2 = 0;
        this.c1r3 = 0;
        this.c1r4 = 0;

        this.c2r1 = 0;
        this.c2r2 = 2 / height;
        this.c2r3 = 0;
        this.c2r4 = 0;

        this.c3r1 = 0;
        this.c3r2 = 0;
        this.c3r3 = 1 / depth;
        this.c3r4 = 0;

        this.c4r1 = -(right + left) / width;
        this.c4r2 = -(top + bottom) / height;
        this.c4r3 = -near / depth;
        this.c4r4 = 1;
    }
}


