
import { createAction, props } from '@ngrx/store';

export const errorMessage = createAction('[Error] Error Message',  props<{ errorMsg: string }>());


