import { createReducer, on } from '@ngrx/store';
import { SpinnerActions } from '../actions';

export interface SpinnerState {
  show: boolean;
}

const initialState: SpinnerState = {
  show: false
};

export const reducer = createReducer(
  initialState,
    on(SpinnerActions.show, state => ({
      ...state,
      show: true
    })),

    on(SpinnerActions.hide, state => ({
      ...state,
      show: false,
    })),
);


export const getSpinnerShow = (state: SpinnerState) => state.show;


