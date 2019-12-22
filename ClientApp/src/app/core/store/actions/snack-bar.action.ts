
import { createAction, props } from '@ngrx/store';
import { SnackBarInterface } from '../../models';

export const open = createAction('[SnackBar] Open', props<{ payload: SnackBarInterface }>());
