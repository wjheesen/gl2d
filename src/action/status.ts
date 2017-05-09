/**
 * The status of an action.
 */
const enum Status {
    /**
     * The action has just begun.
     */
    Start,
    /**
     * The action is ongoing, and movement is occurring.
     */
    Move,
    /**
     * The action is over.
     */
    End,
    /**
     * The action has left the boundaries of the canvas.
     */
    Leave
};

export default Status;