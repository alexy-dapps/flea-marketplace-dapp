export interface AppState {
    router: fromRouter.RouterReducerState<any>;
    spinner: fromSpinner.SpinnerState;
    error: fromError.ErrorState;
  }