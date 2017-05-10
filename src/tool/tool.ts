import { _Action } from '../action/action';

export interface Tool<A extends _Action>{
    onAction(action: A): void;
}

export type _Tool = Tool<_Action>;