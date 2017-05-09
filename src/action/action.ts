import {Status} from './status'

export interface Action<E extends MouseEvent | TouchEvent> {
    /**
     * The status of this action: Start, Move, End, or Leave.
     */
    status: Status;

    /**
     * The event that triggered this action.
     */
    src: E;
}
