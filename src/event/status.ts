/**
 * The status of a surface event.
 */
export const enum Status {
    /**
     * The action has just begun.
     */
    Start,
    /**
     * Movement is occurring, but without dragging.
     */
    Move,
    /**
     * Both movement and dragging are occurring.
     */
    Drag,
    /**
     * The action has left the boundaries of the canvas.
     */
    Leave,
    /**
     * The action is over.
     */
    End,
}