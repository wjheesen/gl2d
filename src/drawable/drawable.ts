import { Renderer } from '../rendering/renderer';

/**
 * Can draw itself using a renderer.
 */
export interface Drawable<R extends Renderer> {

    /**
     * Draws this drawable using the specified renderer.
     */
    draw(renderer: R): void;
}