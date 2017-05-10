export interface Action<E extends Event> {
    /**
     * The event that triggered this action.
     */
    src: E;
}
